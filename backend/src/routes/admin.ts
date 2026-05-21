import express, { Request, Response } from 'express';
import { getGameManager } from '../lib/game.js';
import { publishLoginCode } from '../lib/login-code.js';
import jwt from 'jsonwebtoken';
import { JWTPayload, NextQuestionBody } from '../types/index.js';

const router = express.Router();

function decodeAdminToken(req: Request): JWTPayload | null {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch {
    return null;
  }
}

function requireAdmin(req: Request, res: Response): JWTPayload | null {
  const decoded = decodeAdminToken(req);
  if (!decoded?.email) {
    res.status(401).json({ error: '请先登录' });
    return null;
  }
  if (!decoded.isAdmin || decoded.isDisplay) {
    res.status(401).json({ error: '无权访问' });
    return null;
  }
  return decoded;
}

router.post('/next-question', async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { question, optionA, optionB } = req.body as NextQuestionBody;

    const gameManager = getGameManager();

    if ((await gameManager.getRoomState()).status === 'playing' || (await gameManager.getRoomState()).status === 'ended') {
      return res.status(400).json({ error: '当前有进行中的游戏轮次，请先结束再发布新题目' });
    }

    if (!question || !optionA || !optionB) {
      return res.status(400).json({ error: '请提供题目内容和两个选项' });
    }

    const minorityQuestion = {
      id: `q_${Date.now()}`,
      question,
      optionA,
      optionB,
      startTime: new Date().toISOString()
    };

    await gameManager.startNewRound(minorityQuestion);
    await gameManager.setGameStartState(true);

    return res.status(200).json({
      message: '新题目已发布',
      question: minorityQuestion
    });
  } catch (error: unknown) {
    console.error('发布新题目错误:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
});

// Publish a 6-digit login code for CN region players (broadcast to Show via Socket)
router.post('/publish-login-code', async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const payload = await publishLoginCode();

    return res.status(200).json({
      message: 'Login code published',
      code: payload.code,
      expiresAt: payload.expiresAt,
    });
  } catch (error: unknown) {
    console.error('publish-login-code error:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
});

router.post('/reset-game', async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const gameManager = getGameManager();
    await gameManager.resetGame();
    await gameManager.setGameStartState(false);

    return res.status(200).json({ message: '游戏已重置' });
  } catch (error: unknown) {
    console.error('重置游戏错误:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;
