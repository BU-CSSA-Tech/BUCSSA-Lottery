const { io } = require("socket.io-client");
const { performance } = require("perf_hooks");
const { randomUUID } = require("crypto");
const jwt = require("jsonwebtoken");
const fs = require("fs");
require("dotenv").config();

const CONFIG = {
  apiBase: process.env.E2E_API_BASE || "https://lottery.bucssa.org",
  wsTarget: process.env.E2E_WS_TARGET || "wss://lottery.bucssa.org",
  loginCode: String(process.env.E2E_LOGIN_CODE || "177670").trim(),
  concurrentUsers: Number(process.env.E2E_USERS || 200),
  arrivalRate: Number(process.env.E2E_ARRIVAL_RATE || 20), // users/sec
  testDurationSec: Number(process.env.E2E_DURATION || 180),
  connectTimeoutMs: Number(process.env.E2E_CONNECT_TIMEOUT_MS || 10000),
  ignorePercentage: Number(process.env.E2E_IGNORE_PERCENTAGE || 0.1), // skip answer probability
  ABSplit: Number(process.env.E2E_AB_SPLIT || 0.5),
  maxAnswerDelayMs: Number(process.env.E2E_MAX_ANSWER_DELAY_MS || 5000),
  progressIntervalMs: Number(process.env.E2E_PROGRESS_INTERVAL_MS || 10000),
  outputFile: process.env.E2E_OUTPUT_FILE || "e2e-game-state.json",
};

const stats = {
  usersPlanned: CONFIG.concurrentUsers,
  usersStarted: 0,
  loginSuccess: 0,
  loginFailed: 0,
  wsConnected: 0,
  wsFailed: 0,
  wsDisconnected: 0,
  submitSuccess: 0,
  submitFailed: 0,
  submitSkipped: 0,
  totalMessages: 0,
  events: {
    game_start: 0,
    game_state: 0,
    new_question: 0,
    round_result: 0,
    eliminated: 0,
    winner: 0,
    tie: 0,
  },
  errors: [],
  loginLatencyMs: [],
  wsConnectLatencyMs: [],
  submitLatencyMs: [],
};

const gameData = {
  winner: null,
  tie: [],
  rounds: {},
};

const sockets = [];
const users = [];
let startTime = performance.now();
let stopping = false;

function requireConfig() {
  if (!/^\d{6}$/.test(CONFIG.loginCode)) {
    console.error("❌ E2E_LOGIN_CODE 缺失或格式错误（需要 6 位数字）。");
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET 缺失，无法生成 socket 鉴权 token。");
    process.exit(1);
  }
}

function safePushError(stage, userId, detail) {
  stats.errors.push({
    stage,
    userId,
    detail: String(detail),
    timestamp: Date.now(),
  });
}

function getPercentile(arr, p) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * p));
  return sorted[idx];
}

function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function ensureRound(round) {
  if (!gameData.rounds[round]) {
    gameData.rounds[round] = {
      answerCounts: { A: 0, B: 0 },
      userAnswers: {},
      noAnswers: [],
      eliminated: [],
    };
  }
  return gameData.rounds[round];
}

function generateAuthToken(email, id) {
  return jwt.sign(
    { email, isAdmin: false, isDisplay: false, id },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
      issuer: "lottery-frontend",
      audience: "lottery-backend",
    }
  );
}

class SimUser {
  constructor(id) {
    this.id = id;
    this.playerId = randomUUID();
    this.internalEmail = null;
    this.socket = null;
    this.token = null;
    this.eliminated = false;
    this.currentRound = 0;
  }

  async loginByCode() {
    const t0 = performance.now();
    const url = `${CONFIG.apiBase}/api/auth/verify-code`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: CONFIG.loginCode,
        playerId: this.playerId,
      }),
    });

    const latency = performance.now() - t0;
    stats.loginLatencyMs.push(latency);

    if (!res.ok) {
      const body = await res.text();
      stats.loginFailed++;
      safePushError("code_login", this.id, `${res.status} ${body}`);
      return false;
    }

    const data = await res.json();
    this.internalEmail = data.internalEmail;
    this.token = generateAuthToken(this.internalEmail, this.playerId);
    stats.loginSuccess++;
    return true;
  }

  async startSocket() {
    const t0 = performance.now();
    return new Promise((resolve) => {
      const socket = io(CONFIG.wsTarget, {
        auth: { token: this.token },
        timeout: CONFIG.connectTimeoutMs,
      });
      this.socket = socket;
      sockets.push(socket);

      socket.on("connect", () => {
        const latency = performance.now() - t0;
        stats.wsConnectLatencyMs.push(latency);
        stats.wsConnected++;
        resolve(true);
      });

      socket.on("connect_error", (err) => {
        stats.wsFailed++;
        safePushError("ws_connect", this.id, err?.message || "connect_error");
        resolve(false);
      });

      socket.on("disconnect", () => {
        stats.wsDisconnected++;
      });

      socket.on("game_state", () => {
        stats.totalMessages++;
        stats.events.game_state++;
      });

      socket.on("game_start", () => {
        stats.totalMessages++;
        stats.events.game_start++;
        this.eliminated = false;
      });

      socket.on("new_question", (data) => {
        stats.totalMessages++;
        stats.events.new_question++;
        this.currentRound = Number(data?.round || 0);
        ensureRound(this.currentRound);

        if (this.eliminated) return;

        setTimeout(() => {
          this.submitAnswer().catch((e) =>
            safePushError("submit_answer", this.id, e?.message || e)
          );
        }, Math.random() * CONFIG.maxAnswerDelayMs);
      });

      socket.on("round_result", () => {
        stats.totalMessages++;
        stats.events.round_result++;
      });

      socket.on("eliminated", (data) => {
        stats.totalMessages++;
        stats.events.eliminated++;

        const round = ensureRound(this.currentRound);
        if (Array.isArray(data?.eliminated)) {
          round.eliminated = data.eliminated;
          const eliminatedEmails = new Set(
            data.eliminated.map((x) =>
              typeof x === "string" ? x : x?.userEmail
            )
          );
          if (this.internalEmail && eliminatedEmails.has(this.internalEmail)) {
            this.eliminated = true;
          }
        }
      });

      socket.on("winner", (data) => {
        stats.totalMessages++;
        stats.events.winner++;
        gameData.winner = data?.winnerDisplay || data?.winnerEmail || null;
      });

      socket.on("tie", (data) => {
        stats.totalMessages++;
        stats.events.tie++;
        gameData.tie = data?.finalistsDisplay || data?.finalists || [];
      });
    });
  }

  async submitAnswer() {
    const round = ensureRound(this.currentRound);
    if (Math.random() < CONFIG.ignorePercentage) {
      stats.submitSkipped++;
      if (this.internalEmail) {
        round.noAnswers.push(this.internalEmail);
      }
      return;
    }

    const answer = Math.random() < CONFIG.ABSplit ? "A" : "B";
    const t0 = performance.now();
    const res = await fetch(`${CONFIG.apiBase}/api/submit-answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ answer }),
    });
    const latency = performance.now() - t0;
    stats.submitLatencyMs.push(latency);

    if (res.ok) {
      stats.submitSuccess++;
      if (this.internalEmail) {
        round.userAnswers[this.internalEmail] = answer;
      }
      round.answerCounts[answer] += 1;
      return;
    }

    stats.submitFailed++;
    const body = await res.text();
    safePushError("submit_answer_http", this.id, `${res.status} ${body}`);
  }
}

function printProgress() {
  const elapsed = (performance.now() - startTime) / 1000;
  console.log(
    `⏱️ ${elapsed.toFixed(1)}s | started:${stats.usersStarted}/${stats.usersPlanned} loginOK:${stats.loginSuccess} wsOK:${stats.wsConnected} submitOK:${stats.submitSuccess} submitFail:${stats.submitFailed}`
  );
}

function saveAndPrintFinal() {
  const duration = (performance.now() - startTime) / 1000;
  const summary = {
    config: CONFIG,
    durationSec: Number(duration.toFixed(2)),
    stats: {
      ...stats,
      loginAvgMs: Number(avg(stats.loginLatencyMs).toFixed(2)),
      loginP95Ms: Number(getPercentile(stats.loginLatencyMs, 0.95).toFixed(2)),
      wsConnectAvgMs: Number(avg(stats.wsConnectLatencyMs).toFixed(2)),
      wsConnectP95Ms: Number(
        getPercentile(stats.wsConnectLatencyMs, 0.95).toFixed(2)
      ),
      submitAvgMs: Number(avg(stats.submitLatencyMs).toFixed(2)),
      submitP95Ms: Number(getPercentile(stats.submitLatencyMs, 0.95).toFixed(2)),
    },
    gameData,
  };

  fs.writeFileSync(CONFIG.outputFile, JSON.stringify(summary, null, 2));

  console.log("\n--- 📊 E2E 压测结果 ---");
  console.log(`测试时长: ${duration.toFixed(2)} 秒`);
  console.log(`用户计划/启动: ${stats.usersPlanned}/${stats.usersStarted}`);
  console.log(`登录成功/失败: ${stats.loginSuccess}/${stats.loginFailed}`);
  console.log(`WS 成功/失败: ${stats.wsConnected}/${stats.wsFailed}`);
  console.log(
    `submit 成功/失败/跳过: ${stats.submitSuccess}/${stats.submitFailed}/${stats.submitSkipped}`
  );
  console.log(`总消息数: ${stats.totalMessages}`);
  console.log(`登录 P95: ${getPercentile(stats.loginLatencyMs, 0.95).toFixed(2)}ms`);
  console.log(
    `WS 建连 P95: ${getPercentile(stats.wsConnectLatencyMs, 0.95).toFixed(2)}ms`
  );
  console.log(
    `提交 P95: ${getPercentile(stats.submitLatencyMs, 0.95).toFixed(2)}ms`
  );
  console.log(`结果已保存: ${CONFIG.outputFile}`);
}

async function run() {
  requireConfig();
  startTime = performance.now();

  console.log("🚀 开始 E2E 登录码+游戏压测...");
  console.log(`API: ${CONFIG.apiBase}`);
  console.log(`WS: ${CONFIG.wsTarget}`);
  console.log(`用户数: ${CONFIG.concurrentUsers}`);
  console.log(`到达率: ${CONFIG.arrivalRate} 用户/秒`);
  console.log(`测试时长: ${CONFIG.testDurationSec} 秒`);
  console.log("---");

  const createInterval = setInterval(async () => {
    if (stopping) return;
    if (users.length >= CONFIG.concurrentUsers) return;

    const user = new SimUser(users.length + 1);
    users.push(user);
    stats.usersStarted++;

    try {
      const ok = await user.loginByCode();
      if (!ok) return;
      await user.startSocket();
    } catch (e) {
      safePushError("user_flow", user.id, e?.message || e);
    }
  }, Math.max(1, Math.floor(1000 / CONFIG.arrivalRate)));

  const progressInterval = setInterval(printProgress, CONFIG.progressIntervalMs);

  setTimeout(() => {
    stopping = true;
    clearInterval(createInterval);
    clearInterval(progressInterval);

    setTimeout(() => {
      for (const s of sockets) {
        try {
          s.disconnect();
        } catch (_) {
          // noop
        }
      }
      saveAndPrintFinal();
    }, 5000);
  }, CONFIG.testDurationSec * 1000);
}

process.on("SIGINT", () => {
  console.log("\n🛑 收到中断信号，提前结束测试...");
  stopping = true;
  for (const s of sockets) {
    try {
      s.disconnect();
    } catch (_) {
      // noop
    }
  }
  saveAndPrintFinal();
  process.exit(0);
});

run().catch((e) => {
  console.error("❌ E2E 测试启动失败:", e);
  process.exit(1);
});
