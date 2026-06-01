import { redis, RedisKeys } from './redis.js';
import { ROOM_ID } from './room.js';

function generateSixDigitCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export interface LoginCodePayload {
  code: string;
}

/** Read the active login code. */
export async function getActiveLoginCode(): Promise<LoginCodePayload | null> {
  const code = await redis.get(RedisKeys.loginCode());
  if (!code) return null;

  return { code };
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

  await redis.set(RedisKeys.loginCode(), code);

  const payload: LoginCodePayload = { code };

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
  const hadCode = await redis.exists(RedisKeys.loginCode());
  await redis.del(RedisKeys.loginCode());

  if (!hadCode) return;

  const { getSocketIO } = await import('./socket.js');
  const io = getSocketIO();
  if (io) {
    io.to(ROOM_ID).emit('login_code_closed');
  }
}
