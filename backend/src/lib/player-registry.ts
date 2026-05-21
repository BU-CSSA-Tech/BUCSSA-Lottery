import { redis, RedisKeys } from './redis.js';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidPlayerId(playerId: string): boolean {
  return UUID_REGEX.test(playerId);
}

export function toInternalEmail(playerId: string): string {
  return `player:${playerId}@game.local`;
}

function formatDisplayName(playerNumber: number): string {
  return `玩家 #${String(playerNumber).padStart(3, '0')}`;
}

export interface PlayerIdentity {
  playerId: string;
  internalEmail: string;
  displayName: string;
  playerNumber: number;
}

/** Assign or reuse a display number for a code-login player. */
export async function assignPlayerIdentity(playerId: string): Promise<PlayerIdentity> {
  const internalEmail = toInternalEmail(playerId);

  const existingNumber = await redis.get(RedisKeys.playerDisplayNumber(playerId));
  if (existingNumber) {
    const playerNumber = parseInt(existingNumber, 10);
    const displayName =
      (await redis.get(RedisKeys.playerDisplayName(playerId))) ||
      formatDisplayName(playerNumber);

    return { playerId, internalEmail, displayName, playerNumber };
  }

  const playerNumber = await redis.incr(RedisKeys.playerNumberSeq());
  const displayName = formatDisplayName(playerNumber);

  await redis.set(RedisKeys.playerDisplayNumber(playerId), String(playerNumber));
  await redis.set(RedisKeys.playerDisplayName(playerId), displayName);
  await redis.set(RedisKeys.playerInternalEmail(playerId), internalEmail);
  // Reverse lookup: internal email -> display name for winner/tie emits
  await redis.set(RedisKeys.internalEmailDisplayName(internalEmail), displayName);

  return { playerId, internalEmail, displayName, playerNumber };
}

export async function getDisplayName(internalEmail: string): Promise<string> {
  const cached = await redis.get(RedisKeys.internalEmailDisplayName(internalEmail));
  if (cached) return cached;

  // OAuth users keep their email as display fallback
  if (!internalEmail.startsWith('player:')) {
    return internalEmail;
  }

  return internalEmail.replace('@game.local', '').replace('player:', 'player:');
}

export async function resolveDisplayNames(internalEmails: string[]): Promise<string[]> {
  return Promise.all(internalEmails.map((email) => getDisplayName(email)));
}

/** Remove all player registry keys (called on reset-game). */
export async function clearPlayerRegistry(): Promise<void> {
  const patterns = ['player:*:displayNumber', 'player:*:displayName', 'player:*:internalEmail', 'internal:*:displayName'];
  const BATCH_SIZE = 100;

  for (const pattern of patterns) {
    const batch: string[] = [];
    for await (const keys of redis.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      const keyList = Array.isArray(keys) ? keys : [keys];
      for (const key of keyList) {
        batch.push(key);
        if (batch.length >= BATCH_SIZE) {
          for (const k of batch) await redis.del(k);
          batch.length = 0;
        }
      }
    }
    if (batch.length > 0) {
      for (const k of batch) await redis.del(k);
    }
  }

  await redis.del(RedisKeys.playerNumberSeq());
}
