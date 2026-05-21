import express, { Request, Response } from 'express';
import { assignPlayerIdentity, isValidPlayerId } from '../lib/player-registry.js';
import { validateLoginCode } from '../lib/login-code.js';

const router = express.Router();

interface VerifyCodeBody {
  code?: string;
  playerId?: string;
}

router.post('/verify-code', async (req: Request<object, object, VerifyCodeBody>, res: Response) => {
  try {
    const { code, playerId } = req.body;

    if (!playerId || !isValidPlayerId(playerId)) {
      return res.status(400).json({ error: 'Invalid player ID' });
    }

    if (!code || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Invalid code format' });
    }

    const valid = await validateLoginCode(code);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid or expired login code' });
    }

    const identity = await assignPlayerIdentity(playerId);

    return res.status(200).json({
      playerId: identity.playerId,
      internalEmail: identity.internalEmail,
      displayName: identity.displayName,
      playerNumber: identity.playerNumber,
    });
  } catch (error: unknown) {
    console.error('verify-code error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
