import express, { Request, Response } from 'express';
import { getGameManager } from '../lib/game.js';
import jwt from 'jsonwebtoken';
import { JWTPayload, NextQuestionBody } from '../types/index.js';

const router = express.Router();

// 发布下一题
router.post('/next-question', async (req: Request<object, object, NextQuestionBody>, res: Response) => {
  try {
    const { question, optionA, optionB } = req.body;

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const decoded = token ? jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload : null;

    const userEmail = decoded?.email;
    const isAdmin = decoded?.isAdmin;
    const isDisplay = decoded?.isDisplay;

    // 验证用户邮箱
    if (!userEmail) {
      return res.status(401).json({ error: '请先登录' });
    }

    // 验证用户身份
    if (!isAdmin || isDisplay) {
      return res.status(401).json({ error: '无权访问' });
    }

    const gameManager = getGameManager();

    if ((await gameManager.getRoomState()).status === 'playing' || (await gameManager.getRoomState()).status === 'ended') {
      return res.status(400).json({ error: '当前有进行中的游戏轮次，请先结束再发布新题目' });
    }

    // 验证必要字段
    if (!question || !optionA || !optionB) {
      return res.status(400).json({ error: '请提供题目内容和两个选项' });
    }

    // 创建少数派题目
    const minorityQuestion = {
      id: `q_${Date.now()}`,
      question,
      optionA,
      optionB,
      startTime: new Date().toISOString()
    };

    // 开始新一轮
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

// 重置游戏
router.post('/reset-game', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const decoded = token ? jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload : null;

    const userEmail = decoded?.email;
    const isAdmin = decoded?.isAdmin;
    const isDisplay = decoded?.isDisplay;

    // 验证用户邮箱
    if (!userEmail) {
      return res.status(401).json({ error: '请先登录' });
    }

    // 验证用户身份
    if (!isAdmin || isDisplay) {
      return res.status(401).json({ error: '无权访问' });
    }

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