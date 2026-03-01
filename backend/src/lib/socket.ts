import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { redis, RedisKeys } from './redis.js';
import { getGameManager } from './game.js';
import { ROOM_ID } from './room.js';
import { ensureRecovered } from './recovery.js';
import jwt from 'jsonwebtoken';
import type { JWTPayload } from '../types/index.js';


// 全局Socket.IO服务器实例
let io: SocketIOServer | null = null;

export function initializeSocketIO(httpServer: HTTPServer): SocketIOServer {
  if (io) {
    return io;
  }

  console.log("Socket origin:", process.env.FRONTEND_URL);

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'], // Explicitly allow both transports
    allowEIO3: true, // Backward compatibility
    pingTimeout: 60000, // Increase timeout for Railway
    pingInterval: 25000, // Keep connection alive
  });

  // 中间件：验证用户身份（必须携带 accessToken，后端验签后获取 email/role）
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token || typeof token !== 'string') {
        return next(new Error('未提供 token'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!, {
        issuer: 'lottery-frontend',
        audience: 'lottery-backend',
      }) as JWTPayload;

      if (!decoded?.email) {
        return next(new Error('token 缺少邮箱'));
      }

      socket.data.user = { email: decoded.email, isAdmin: decoded.isAdmin, isDisplay: decoded.isDisplay };

      next();
    } catch (error) {
      next(new Error('认证失败'));
    }
  });

  // 连接事件处理
  io.on('connection', async (socket) => {
    // If Redis lost state (restart/crash), restore minimal state from PG snapshot.
    await ensureRecovered();

    const gameManager = getGameManager();
    const user = socket.data.user;

    // 用户加入游戏房间
    socket.join(ROOM_ID);

    const gameStarted = await redis.get(RedisKeys.gameStarted()) === '1';
    const isAdmin = Boolean(user?.isAdmin);
    const isDisplay = Boolean(user?.isDisplay);
    const isSurviving = await redis.sIsMember(RedisKeys.roomSurvivors(), user.email);
    const isEliminated = await redis.sIsMember(RedisKeys.roomEliminated(), user.email);
    const tieSet = await redis.sMembers(RedisKeys.gameTie());
    const isTie = tieSet ? tieSet.includes(user.email) : false;
    const isWinner = await redis.get(RedisKeys.gameWinner()) === user.email;
    const isExistingPlayer = isSurviving || isEliminated || isWinner || isTie;


    // Only block NEW users from joining if game has started
    // Allow existing players (survivors, eliminated, winners, tied) to reconnect

    if (gameStarted && !isAdmin && !isDisplay && !isExistingPlayer) {
      socket.emit('redirect', {
        message: '游戏已开始，请等待下一轮游戏'
      });
      socket.disconnect();
      return;
    }

    if (!isAdmin && !isDisplay && !isExistingPlayer) {
      // 新用户加入游戏
      await gameManager.addPlayer(user.email);
      gameManager.emitPlayerCountUpdate();
    }

    const roomState = await gameManager.getRoomState();

    if (isAdmin) {
      socket.emit("game_state", { ...roomState, userAnswer: null });
    } else if (isDisplay) {
      socket.emit("game_state", { ...roomState, userAnswer: null });
    } else {
      const playerState = await gameManager.getPlayerGameState(roomState, user.email);
      socket.emit("game_state", playerState);
    }

    if (isDisplay) {
      const remainingTime = gameManager.getCurrentTimeLeft();
      socket.emit('countdown_update', { timeLeft: remainingTime });

      const winner = await redis.get(RedisKeys.gameWinner());
      const tie = await redis.sMembers(RedisKeys.gameTie());

      if (winner) {
        socket.emit('winner', {
          winnerEmail: winner,
        });
      } else if (tie) {
        socket.emit('tie', {
          finalists: tie,
        });
      }
    }

    // 断开连接处理
    socket.on('disconnect', () => {
      const user = socket.data.user;
      if (user && !isAdmin && !isDisplay) {
        redis.del(RedisKeys.userOnline(user.email));
        // redis.sRem(RedisKeys.roomSurvivors(), user.email);
      }
      gameManager.emitPlayerCountUpdate();
    });

    socket.on('submit_answer', async (data) => {
      try {
        const { answer } = data;
        const user = socket.data.user;

        if (isAdmin || isDisplay) {
          socket.emit('answer_error', { error: '无权访问' });
          return;
        }

        if (!answer || !['A', 'B'].includes(answer)) {
          socket.emit('answer_error', { error: '请选择A或B选项' });
          return;
        }

        await gameManager.submitAnswer(user.email, answer);

        socket.emit('answer_submitted', {
          message: '答案已提交',
          answer
        });

        const roomState = await gameManager.getRoomState();
        const questionId = roomState.currentQuestion?.id;

        if (questionId) {
          const playerState = await gameManager.getPlayerGameState(roomState, user.email);
          socket.emit('game_state', playerState);
        } else {
          console.error(`⚠️  [提交答案] 当前没有有效的题目ID`, {
            userEmail: user.email,
            roomState: roomState
          });
        }

        // 获取当前答案统计并记录
        const currentAnswers = await redis.hGetAll(RedisKeys.gameAnswers());

      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        const stack = error instanceof Error ? error.stack : undefined;
        console.error(`💥 [提交答案] 处理答案提交时发生错误`, {
          userEmail: socket.data.user?.email,
          error: message,
          stack,
          timestamp: new Date().toISOString()
        });

        if (message === '没有进行中的游戏') {
          console.error(`🚫 [提交答案] 没有进行中的游戏`, {
            userEmail: socket.data.user?.email
          });
          socket.emit('answer_error', { error: '当前没有进行中的游戏' });
        } else if (message === '您已被淘汰') {
          console.error(`☠️  [提交答案] 用户已被淘汰`, {
            userEmail: socket.data.user?.email
          });
          socket.emit('answer_error', { error: '您已被淘汰，无法继续答题' });
        } else {
          console.error(`🔥 [提交答案] 服务器内部错误`, {
            userEmail: socket.data.user?.email,
            errorMessage: message
          });
          socket.emit('answer_error', { error: '服务器内部错误' });
        }
      }
    });
  });

  return io;
}

// 获取Socket.IO实例
export function getSocketIO(): SocketIOServer | null {
  return io;
} 