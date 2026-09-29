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
    question: "如果一定要吃其中一个月饼，你会选：",
    optionA: "鲱鱼罐头味",
    optionB: "豆汁儿味",
  },
  {
    id: "q2",
    question: "假如职场突然有人来抓小三，你会：",
    optionA: "我不是凌凌",
    optionB: "你是罗子君妈妈？",
  },
  {
    id: "q3",
    question: "如果嫦娥可以选一个帮他搬10个箱子，你会选：",
    optionA: "井柏然",
    optionB: "杨洋",
  },
  {
    id: "q4",
    question: "如果中秋晚宴是《甄嬛传》宫宴，你最不想坐在谁旁边：",
    optionA: "华妃——怕说错一句话",
    optionB: "嫦娥——怕她全程只跟玉兔说话",
  },
  {
    id: "q5",
    question: "如果你能把一个人发配月球，你会选：",
    optionA: "前任",
    optionB: "小组作业永远不回消息的人",
  },
  {
    id: "q6",
    question: "如果嫦娥需要一个人陪她解闷，她会选：",
    optionA: "胡巴",
    optionB: "胡巴妈",
  },
  {
    id: "q7",
    question: "如果嫦娥长得像明星，你会希望她像：",
    optionA: "Angelababy",
    optionB: "范冰冰",
  },
  {
    id: "q8",
    question: "HR问：「你抗压能力怎么样？」你会：",
    optionA: "「活都活到现在了，你说呢。」",
    optionB: "「不知道，我的精神状态很曼妙。」",
  },
  {
    id: "q9",
    question: "长口腔溃疡了，你会：",
    optionA: "老实用西瓜霜，等它好",
    optionB: "吃辣的，让它知道谁是身体的主人",
  },
  {
    id: "q10",
    question: "在一月份大雪纷飞的波士顿，你选择：",
    optionA: "穿的恶心但暖和",
    optionB: "穿的好看但冻死",
  },
  {
    id: "q11",
    question: "公司突然宣布「今晚大家一起团建」，你第一反应：",
    optionA: "爱你老己，今天又要受苦了",
    optionB: "全员大耍起时代，耍完再说",
  },
  {
    id: "q12",
    question: "朋友说话听不清，你会：",
    optionA: "假装听懂，说哦～",
    optionB: "再次询问说的什么",
  },
  {
    id: "q13",
    question: "老板突然让你来办公室找他谈话，你会：",
    optionA: "OMG 你吓到我了",
    optionB: "差一步美满",
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

    socket.on("login_code_published", () => {
      setLoginCodeStatus("published");
    });

    socket.on("login_code_status", () => {
      setLoginCodeStatus("published");
    });

    socket.on("login_code_closed", () => {
      setLoginCodeStatus("idle");
    });

    return () => {
      socket.disconnect();
    };
  }, [status, session]); // Remove gameStats.currentRound dependency

  const handleSubmitQuestion = async (questionIndex: number) => {
    if (questionIndex >= PRESET_QUESTIONS.length) {
      return;
    }

    if (loginCodeStatus === "published") {
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
          loginCodePublished={loginCodeStatus === "published"}
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
