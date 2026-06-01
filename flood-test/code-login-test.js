const { performance } = require("perf_hooks");
const { randomUUID } = require("crypto");
const fs = require("fs");
require("dotenv").config();

const CONFIG = {
  target: process.env.CODE_LOGIN_TEST_TARGET || "http://localhost:4000",
  endpoint: process.env.CODE_LOGIN_TEST_ENDPOINT || "/api/auth/verify-code",
  loginCode: (process.env.CODE_LOGIN_TEST_CODE || "363046").trim(),
  testDurationSec: Number(process.env.CODE_LOGIN_TEST_DURATION || 30),
  arrivalRate: Number(process.env.CODE_LOGIN_TEST_ARRIVAL_RATE || 100), // attempts / sec
  maxInFlight: Number(process.env.CODE_LOGIN_TEST_MAX_IN_FLIGHT || 100),
  timeoutMs: Number(process.env.CODE_LOGIN_TEST_TIMEOUT_MS || 10000),
  progressIntervalMs: Number(process.env.CODE_LOGIN_TEST_PROGRESS_MS || 5000),
  outputFile: process.env.CODE_LOGIN_TEST_OUTPUT || "code-login-success.json",
};

const stats = {
  attempts: 0,
  success: 0,
  failed: 0,
  timeout: 0,
  byStatus: {},
  latencies: [],
  errors: [],
  successPlayers: [],
};

let startTime = performance.now();

function validateConfig() {
  if (!/^\d{6}$/.test(CONFIG.loginCode)) {
    console.error(
      "❌ CODE_LOGIN_TEST_CODE 缺失或格式错误（需要 6 位数字登录码）。"
    );
    console.error("   先在 admin 发布登录码，再在 .env 设置 CODE_LOGIN_TEST_CODE。");
    process.exit(1);
  }

  if (!global.fetch) {
    console.error("❌ 当前 Node 环境没有 fetch，请升级到 Node 18+。");
    process.exit(1);
  }
}

function addStatus(statusKey) {
  stats.byStatus[statusKey] = (stats.byStatus[statusKey] || 0) + 1;
}

async function runSingleAttempt(attemptId) {
  const playerId = randomUUID();
  const url = `${CONFIG.target}${CONFIG.endpoint}`;
  const t0 = performance.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONFIG.timeoutMs);

  stats.attempts++;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: CONFIG.loginCode,
        playerId,
      }),
      signal: controller.signal,
    });

    const latency = performance.now() - t0;
    stats.latencies.push(latency);
    addStatus(String(response.status));

    if (response.ok) {
      const data = await response.json();
      stats.success++;
      stats.successPlayers.push({
        attemptId,
        playerId,
        internalEmail: data.internalEmail,
        displayName: data.displayName,
        playerNumber: data.playerNumber,
        latencyMs: Number(latency.toFixed(2)),
      });
      return;
    }

    stats.failed++;
    const bodyText = await response.text();
    stats.errors.push({
      attemptId,
      playerId,
      status: response.status,
      body: bodyText,
      latencyMs: Number(latency.toFixed(2)),
    });
  } catch (error) {
    const latency = performance.now() - t0;
    stats.latencies.push(latency);
    stats.failed++;

    if (error && error.name === "AbortError") {
      stats.timeout++;
      addStatus("timeout");
      stats.errors.push({
        attemptId,
        playerId,
        status: "timeout",
        body: `Request timed out after ${CONFIG.timeoutMs}ms`,
        latencyMs: Number(latency.toFixed(2)),
      });
      return;
    }

    addStatus("network_error");
    stats.errors.push({
      attemptId,
      playerId,
      status: "network_error",
      body: String(error && error.message ? error.message : error),
      latencyMs: Number(latency.toFixed(2)),
    });
  } finally {
    clearTimeout(timeout);
  }
}

function printFinalStats() {
  const durationSec = (performance.now() - startTime) / 1000;
  const latencies = [...stats.latencies].sort((a, b) => a - b);

  const percentile = (p) => {
    if (!latencies.length) return 0;
    const index = Math.min(
      latencies.length - 1,
      Math.floor(latencies.length * p)
    );
    return latencies[index];
  };

  const avgLatency =
    latencies.length === 0
      ? 0
      : latencies.reduce((a, b) => a + b, 0) / latencies.length;

  console.log("\n--- 📊 登录码压力测试结果 ---");
  console.log(`目标: ${CONFIG.target}${CONFIG.endpoint}`);
  console.log(`测试时长: ${durationSec.toFixed(2)} 秒`);
  console.log(`总请求数: ${stats.attempts}`);
  console.log(`成功请求: ${stats.success}`);
  console.log(`失败请求: ${stats.failed}`);
  console.log(`超时请求: ${stats.timeout}`);
  console.log(
    `成功率: ${stats.attempts > 0 ? ((stats.success / stats.attempts) * 100).toFixed(2) : "0.00"}%`
  );
  console.log(`平均吞吐: ${(stats.attempts / durationSec).toFixed(2)} req/s`);
  console.log(`平均延迟: ${avgLatency.toFixed(2)}ms`);
  console.log(`P50 延迟: ${percentile(0.5).toFixed(2)}ms`);
  console.log(`P90 延迟: ${percentile(0.9).toFixed(2)}ms`);
  console.log(`P95 延迟: ${percentile(0.95).toFixed(2)}ms`);
  console.log(`P99 延迟: ${percentile(0.99).toFixed(2)}ms`);

  console.log("\n--- HTTP/错误分布 ---");
  Object.entries(stats.byStatus)
    .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
    .forEach(([status, count]) => {
      console.log(`${status}: ${count}`);
    });

  fs.writeFileSync(CONFIG.outputFile, JSON.stringify(stats.successPlayers, null, 2));
  console.log(`\n💾 成功登录用户已保存到 ${CONFIG.outputFile}`);
}

async function runCodeLoginTest() {
  validateConfig();

  console.log("🚀 开始登录码压力测试...");
  console.log(`目标: ${CONFIG.target}${CONFIG.endpoint}`);
  console.log(`登录码: ${CONFIG.loginCode}`);
  console.log(`测试时长: ${CONFIG.testDurationSec} 秒`);
  console.log(`到达率: ${CONFIG.arrivalRate} 请求/秒`);
  console.log(`最大在途请求: ${CONFIG.maxInFlight}`);
  console.log("---");

  const pending = new Set();
  let attemptId = 0;

  const scheduler = setInterval(() => {
    if (pending.size >= CONFIG.maxInFlight) return;

    const p = runSingleAttempt(++attemptId).finally(() => pending.delete(p));
    pending.add(p);
  }, Math.max(1, Math.floor(1000 / CONFIG.arrivalRate)));

  const progress = setInterval(() => {
    const elapsed = (performance.now() - startTime) / 1000;
    console.log(
      `⏱️ ${elapsed.toFixed(1)}s - 请求: ${stats.attempts}, 成功: ${stats.success}, 失败: ${stats.failed}, 在途: ${pending.size}`
    );
  }, CONFIG.progressIntervalMs);

  setTimeout(async () => {
    clearInterval(scheduler);
    clearInterval(progress);

    await Promise.all(Array.from(pending));
    printFinalStats();
  }, CONFIG.testDurationSec * 1000);
}

process.on("SIGINT", async () => {
  console.log("\n\n🛑 收到中断信号，提前输出统计...");
  printFinalStats();
  process.exit(0);
});

runCodeLoginTest();
