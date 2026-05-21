import { redis, RedisKeys } from './redis.js';
import { ROOM_ID } from './room.js';

const LOGIN_CODE_TTL_SECONDS = 60;

function generateSixDigitCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export interface LoginCodePayload {
  code: string;
  expiresAt: number;
}

/** Read the active login code if still valid. */
export async function getActiveLoginCode(): Promise<LoginCodePayload | null> {
  const code = await redis.get(RedisKeys.loginCode());
  if (!code) return null;

  const expiresAtRaw = await redis.get(RedisKeys.loginCodeExpiresAt());
  const expiresAt = expiresAtRaw ? parseInt(expiresAtRaw, 10) : 0;
  if (!expiresAt || Date.now() >= expiresAt) {
    return null;
  }

  return { code, expiresAt };
}

/** Validate a submitted code against Redis. */
export async function validateLoginCode(code: string): Promise<boolean> {
  const active = await getActiveLoginCode();
  if (!active) return false;
  return active.code === code;
}

/** Publish a new login code and broadcast to the room. */
export async function publishLoginCode(): Promise<LoginCodePayload> {
  const code = generateSixDigitCode();
  const expiresAt = Date.now() + LOGIN_CODE_TTL_SECONDS * 1000;

  await redis.set(RedisKeys.loginCode(), code, { EX: LOGIN_CODE_TTL_SECONDS });
  await redis.set(RedisKeys.loginCodeExpiresAt(), String(expiresAt), {
    EX: LOGIN_CODE_TTL_SECONDS,
  });

  const payload: LoginCodePayload = { code, expiresAt };

  const { getSocketIO } = await import('./socket.js');
  const io = getSocketIO();
  if (io) {
    io.to(ROOM_ID).emit('login_code_published', payload);
  }

  return payload;
}

/** Emit current login code to a single socket (Show reconnect). */
export async function emitLoginCodeStatus(socketId: string): Promise<void> {
  const active = await getActiveLoginCode();
  if (!active) return;

  const { getSocketIO } = await import('./socket.js');
  const io = getSocketIO();
  if (!io) return;

  io.to(socketId).emit('login_code_status', active);
}

/** Clear login code keys (reset-game). */
export async function clearLoginCode(): Promise<void> {
  await redis.del(RedisKeys.loginCode());
  await redis.del(RedisKeys.loginCodeExpiresAt());
}
