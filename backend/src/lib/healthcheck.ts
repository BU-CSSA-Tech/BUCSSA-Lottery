import { ensureRecovered } from './recovery.js';

const PRIMARY_URL = 'https://api.lottery.bucssa.org/health';

const INTERVAL_MS = 20_000;

async function checkHealth(url: string): Promise<boolean> {
  try {
    const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(5_000) });
    return res.ok;
  } catch {
    return false;
  }
}

export function startHealthCheckLoop(): void {
  setInterval(async () => {
    const healthy = await checkHealth(PRIMARY_URL);
    if (!healthy) {
      console.warn(`[healthcheck] Primary server (${PRIMARY_URL}) is down — running recovery`);
      await ensureRecovered();
    }
  }, INTERVAL_MS);

  console.log(`[healthcheck] Monitoring primary server every ${INTERVAL_MS / 1000}s`);
}
