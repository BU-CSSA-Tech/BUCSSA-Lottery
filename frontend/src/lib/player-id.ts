const STORAGE_KEY = 'bucssa_lottery_player_id';

/** Read or create a persistent anonymous player ID in localStorage. */
export function getOrCreatePlayerId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const id = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, id);
  return id;
}
