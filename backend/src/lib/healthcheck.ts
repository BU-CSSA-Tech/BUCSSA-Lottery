import { ensureRecovered } from './recovery.js';

const INTERVAL_MS = 20_000;

async function checkHealth(url: string): Promise<boolean> {
  try {
    const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(5_000) });
    if (res.ok) {
      console.log("[healthcheck] Primary server is healthy");
    }
    return res.ok;
  } catch (error) {
    console.warn("[healthcheck] Error checking primary server health:", error);
    return false;
  }
}

export function startHealthCheckLoop(): void {
  setInterval(async () => {
    const healthy = await checkHealth(process.env.API_BASE || 'http://localhost:4000');
    if (!healthy) {
      console.warn(`[healthcheck] Primary server (${process.env.API_BASE || 'http://localhost:4000'}) is down — running recovery`);
      await ensureRecovered();
    }
  }, INTERVAL_MS);
  console.log(`[healthcheck] Monitoring primary server every ${INTERVAL_MS / 1000}s`);
}
