"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { GameState, MinorityQuestion } from "@/types";
import { AlertBox } from "@/components/ui/alert-box";
import AdminHeader from "@/components/game/admin/AdminHeader";
import GameStatusPanel from "@/components/game/admin/GameStatusPanel";
import QuestionList from "@/components/game/admin/QuestionList";
import CurrentQuestionDisplay from "@/components/game/admin/CurrentQuestionDisplay";

// 预设题目列表
const PRESET_QUESTIONS = [
  {
    id: "q1",
    question: "玉兔怎么上天的？",
    optionA: "被嫦娥踹上去的",
    optionB: "喝丝瓜汤飞升了",
  },
  {
    id: "q2",
    question: "嫦娥最想要？",
    optionA: "余生哥哥给她买包包",
    optionB: "鸡排主理人做鸡排",
  },
  {
    id: "q3",
    question: "你是什么？",
    optionA: "小馋猫",
    optionB: "小奶狗",
  },
  {
    id: "q4",
    question: "月亮为什么这么圆？",
    optionA: "吴刚用 Photoshop 修的",
    optionB: "打了玻尿酸",
  },
  {
    id: "q5",
    question: "嫦娥最怕什么？",
    optionA: "月饼过期",
    optionB: "天上没 WiFi",
  },
  {
    id: "q6",
    question: "如果中秋月饼和国庆烟花只能留一个，你选？",
    optionA: "吃饱了再说",
    optionB: "看爽了再说",
  },
  {
    id: "q7",
    question: "如果月亮突然有信号塔了，嫦娥第一句会发什么朋友圈？",
    optionA: "终于连上网了，买了否冷",
    optionB: "家人们十个赞今天不上班",
  },
  {
    id: "q8",
    question: "为什么玉兔总跟着嫦娥走？",
    optionA: "开团秒跟",
    optionB: "害怕嫦娥点外卖不叫他",
  },
  {
    id: "q9",
    question: "嫦娥在月球上点的一个饭团外卖是什么？",
    optionA: "麻辣兔头",
    optionB: "兔兔那么可爱，怎么可以吃兔兔～",
  },
  {
    id: "q10",
    question: "吃了玉兔捣的药我…？",
    optionA: "头怎么感觉尖尖的",
    optionB: "变成火辣辣的纯情蟑螂",
  },
  {
    id: "q11",
    question: "怎样让后裔奔月？",
    optionA: "来咯来咯后裔哥哥上车咯",
    optionB: "堂吉柯德式的冲锋",
  },
  {
    id: "q12",
    question: "梦幻月亮上的嫦娥为什么哭哭？",
    optionA: "幻梦都破碎",
    optionB: "月亮上的天气那是翻云又覆雨",
  },
];

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

    socket.on("tie", (data: any) => {
      setTie(data.finalists);
      setWinner(null);
    });

    socket.on("winner", (data: any) => {
      setWinner(data.winnerEmail);
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
    const isRepublish = sentQuestions.has(questionIndex);
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
    } catch (error) {
      console.error("网络错误，请稍后重试");
    } finally {
      setLoading(false);
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
      } else {
        console.error("重置游戏失败:", data.error);
      }
    } catch (error) {
      console.error("重置游戏错误:", error);
    } finally {
      setLoading(false);
    }
  };

  // const handleEndRound = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_BASE}/api/admin/end-round`,
  //       {
  //         method: "POST",
  //       }
  //     );
  //     const data = await response.json();
  //     console.log("结束轮次响应:", data);
  //     if (response.ok) {
  //       setGameState((prev) => ({ ...prev, status: "waiting" }));
  //     }
  //     else {
  //       console.error("结束轮次失败:", data.error);
  //     }
  //   } catch (error) {
  //     console.error("结束轮次错误:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };


  return (
    <div className="min-h-screen bg-gray-900/75">
      {/* Header */}
      <AdminHeader
        connected={connected}
        loading={loading}
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
