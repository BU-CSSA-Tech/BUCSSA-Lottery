"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { GameState } from "@/types";
import { AlertBox } from "@/components/ui/alert-box";
import AdminHeader from "@/components/game/admin/AdminHeader";
import GameStatusPanel from "@/components/game/admin/GameStatusPanel";
import QuestionList from "@/components/game/admin/QuestionList";
import CurrentQuestionDisplay from "@/components/game/admin/CurrentQuestionDisplay";

// 预设题目列表
const PRESET_QUESTIONS = [
  {
    id: "q1",
    question: "开学第一周你会优先做的事？",
    optionA: "打卡BU Beach，在标志性草坪上拍照",
    optionB: "去Warren Towers食堂吃第一顿BU餐",
  },
  {
    id: "q2",
    question: "更想住在哪个宿舍？",
    optionA: "West Campus（更多大一活动）",
    optionB: "East Campus（离课堂更近）",
  },
  {
    id: "q3",
    question: "去波士顿市中心首选？",
    optionA: "坐BU校车（BUS）",
    optionB: "坐绿线T（Green Line T）",
  },
  {
    id: "q4",
    question: "春假你会？",
    optionA: "留在波士顿探索",
    optionB: "飞走去暖和的地方",
  },
  {
    id: "q5",
    question: "你觉得「BU学生最常说的话」会是？",
    optionA: "「快点走，要迟到了」",
    optionB: "「今天中午吃啥」",
  },
  {
    id: "q6",
    question: "对于「BUCSSA新生见面会」你的真实心情是？",
    optionA: "有点紧张但期待认识人",
    optionB: "随便参加一下",
  },
  {
    id: "q7",
    question: "你更害怕哪种情况？",
    optionA: "手机没电",
    optionB: "手机没信号",
  },
  {
    id: "q8",
    question: "收到很长的语音消息，你会？",
    optionA: "听完",
    optionB: "转文字看",
  },
  {
    id: "q9",
    question: "你更喜欢哪种早餐？",
    optionA: "咸口的（如包子、咸粥）",
    optionB: "甜口的（如面包、甜豆浆）",
  },
  {
    id: "q10",
    question: "你希望自己的BU室友是？",
    optionA: "同样作息的人",
    optionB: "不同专业的人（可以聊天）",
  },
  {
    id: "q11",
    question: "你更怕哪种教授？",
    optionA: "点名提问型",
    optionB: "作业超多型",
  },
  {
    id: "q12",
    question: "如果有一门课叫「波士顿的天气与翘课心理学」，你会？",
    optionA: "冲着名字选它",
    optionB: "怕它真的点名",
  },
  {
    id: "q13",
    question: "如果考试时你发现旁边同学写得飞快，你会？",
    optionA: "开始怀疑人生",
    optionB: "坚信他一定是写错了",
  },
  {
    id: "q14",
    question: "你更怕哪种考试形式？",
    optionA: "开卷但根本找不到答案",
    optionB: "闭卷但考的都没复习到",
  },
  {
    id: "q15",
    question: "你觉得自己四年后在BU最可能留下的传说是？",
    optionA: "某门课拿过全班最高分",
    optionB: "连续一周穿睡衣出现在图书馆",
  },
  {
    id: "q16",
    question: "你更倾向于哪种吃饭方式？",
    optionA: "吃食堂",
    optionB: "点外卖",
  },
  {
    id: "q17",
    question: "在考试前，你会选择？",
    optionA: "一直复习",
    optionB: "前一夜冲刺",
  },
];

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [publishingCode, setPublishingCode] = useState(false);
  const [closingCode, setClosingCode] = useState(false);
  const [loginCodeStatus, setLoginCodeStatus] = useState<"idle" | "published">("idle");

  const [connected, setConnected] = useState(false);
  const [tie, setTie] = useState<string[] | null>(null);
  const [winner, setWinner] = useState<string | null>(null);

  const [sentQuestions, setSentQuestions] = useState<Set<number>>(new Set());
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    round: 0,
    status: "waiting",
    currentQuestion: null,
    answers: { A: 0, B: 0 },
    survivorsCount: 0,
    eliminatedCount: 0,
    timeLeft: 0,
  });
  const socketRef = useRef<Socket | null>(null);

  // 认证检查
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "loading") {
      return; // 等待认证状态
    }

    if (!session?.user?.email) {
      return;
    }

    if (!session?.user?.isAdmin) {
      router.push("/play"); // 非管理员重定向到首页
      return;
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated") return; // 只有认证后才建立连接

    if (!session?.user?.email) {
      return;
    }

    if (!session.user.accessToken) {
      return;
    }

    if (!session.user.isAdmin) {
      return;
    }

    if (session.user.isDisplay) {
      return;
    }

    const socket = io(process.env.NEXT_PUBLIC_API_BASE!, {
      auth: {
        token: session.user.accessToken,
      },
      transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
      upgrade: true, // Allow transport upgrade
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("game_start", (data: GameState) => {
      setGameState(data);
    });

    socket.on("game_state", (data: GameState) => {
      setGameState(data);
      // 从 roomState 同步 winner/tie，避免重连后只收到 game_state 而漏掉 tie/winner 事件
      if (data.tie && data.tie.length >= 2) {
        setTie(data.tie);
        setWinner(null);
      } else if (data.winner) {
        setWinner(data.winner);
        setTie(null);
      }
    });

    socket.on("new_question", (data: GameState) => {
      setGameState(data);
    });

    socket.on("round_result", (data: GameState) => {
      setGameState(data);
    });

    socket.on("tie", (data: { finalists?: string[]; finalistsDisplay?: string[] }) => {
      setTie(data.finalistsDisplay ?? data.finalists ?? null);
      setWinner(null);
    });

    socket.on("winner", (data: { winnerEmail?: string; winnerDisplay?: string }) => {
      setWinner(data.winnerDisplay ?? data.winnerEmail ?? null);
      setTie(null);
    });

    socket.on("game_reset", () => {
      setSentQuestions(new Set());
    });

    return () => {
      socket.disconnect();
    };
  }, [status, session]); // Remove gameStats.currentRound dependency

  const handleSubmitQuestion = async (questionIndex: number) => {
    if (questionIndex >= PRESET_QUESTIONS.length) {
      return;
    }

    const questionData = PRESET_QUESTIONS[questionIndex];
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/admin/next-question`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
          body: JSON.stringify(questionData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSentQuestions((prev) => new Set([...prev, questionIndex]));
      } else {
        console.error(data.error || "发布题目失败");
      }
    } catch {
      console.error("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handlePublishLoginCode = async () => {
    setPublishingCode(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/admin/publish-login-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setLoginCodeStatus("published");
      } else {
        console.error("发布登录码失败:", data.error);
      }
    } catch (error) {
      console.error("发布登录码错误:", error);
    } finally {
      setPublishingCode(false);
    }
  };

  const handleCloseLoginCode = async () => {
    setClosingCode(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/admin/close-login-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setLoginCodeStatus("idle");
      } else {
        console.error("关闭登录码失败:", data.error);
      }
    } catch (error) {
      console.error("关闭登录码错误:", error);
    } finally {
      setClosingCode(false);
    }
  };

  const handleResetGame = async () => {
    if (!confirm("确定要重置游戏吗？这将清除所有数据。")) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/admin/reset-game`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setGameState({
          round: 0,
          status: "waiting",
          currentQuestion: null,
          answers: { A: 0, B: 0 },
          survivorsCount: 0,
          eliminatedCount: 0,
          timeLeft: 0,
        });
        setSentQuestions(new Set());
        setLoginCodeStatus("idle");
      } else {
        console.error("重置游戏失败:", data.error);
      }
    } catch (error) {
      console.error("重置游戏错误:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };


  return (
    <div className="h-screen overflow-y-auto bg-gray-900/75">
      {/* Header */}
      <AdminHeader
        connected={connected}
        loading={loading}
        loginCodeStatus={loginCodeStatus}
        publishingCode={publishingCode}
        closingCode={closingCode}
        onPublishLoginCode={handlePublishLoginCode}
        onCloseLoginCode={handleCloseLoginCode}
        onResetGame={handleResetGame}
        onShowLogoutConfirm={() => setShowLogoutConfirm(true)}
      />

      <main className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Status Banner + Stats Grid */}
        <GameStatusPanel gameState={gameState} winner={winner} tie={tie} />

        {/* 题目列表 - 始终可见 */}
        <QuestionList
          questions={PRESET_QUESTIONS}
          sentQuestions={sentQuestions}
          gameState={gameState}
          loading={loading}
          onSubmitQuestion={handleSubmitQuestion}
        />

        {/* Current Question Display */}
        {gameState.currentQuestion && (
          <CurrentQuestionDisplay gameState={gameState} />
        )}
      </main>

      {/* Logout Confirmation Alert Box */}
      <AlertBox
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="确认退出"
        message="您确定要退出登录吗？退出后将返回主界面。"
        confirmText="退出登录"
        cancelText="取消"
        confirmVariant="destructive"
      />
    </div>
  );
}
