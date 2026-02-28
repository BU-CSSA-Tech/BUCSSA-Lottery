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
    question: "饺子馅偏好",
    optionA: "猪肉白菜",
    optionB: "韭菜鸡蛋",
  },
  {
    id: "q2",
    question: "关于春节的「身材管理」",
    optionA: "依旧自律，16+8减肥法",
    optionB: "爽吃，16个小时吃8顿！",
  },
  {
    id: "q3",
    question: "突降10万大红包，你会",
    optionA: "老实攒着，未雨绸缪",
    optionB: "反手花掉，及时行乐",
  },
  {
    id: "q4",
    question: "2026年你的「暴富」信念",
    optionA: "靠勤劳双手，做最强牛马",
    optionB: "靠运气锦鲤，等一个天降横财",
  },
  {
    id: "q5",
    question: "春节社交局",
    optionA: "打麻将",
    optionB: "打斗地主",
  },
  {
    id: "q6",
    question: "如何看待朋友圈迎财神",
    optionA: "接接接，我要发财",
    optionB: "呵呵呵",
  },
  {
    id: "q7",
    question: "新年第一天状态",
    optionA: "早起上课",
    optionB: "睡懒觉",
  },
  {
    id: "q8",
    question: "祝福语风格",
    optionA: "骏马奔腾，前程似锦",
    optionB: "新的一年我踏马来了",
  },
  {
    id: "q9",
    question: "你对2026的期待是",
    optionA: "遇到那个对的人",
    optionB: "遇到那份赚大钱的机会",
  },
  {
    id: "q10",
    question: "新一年的整体心情",
    optionA: "满怀期待",
    optionB: "随遇而安",
  },
  {
    id: "q11",
    question: "听 step.jad 时的状态",
    optionA: "深夜独处，emo治愈",
    optionB: "通勤",
  },
  {
    id: "q12",
    question: "step.jad 的歌你更喜欢",
    optionA: "《思念病》",
    optionB: "《迷宫》",
  },
  {
    id: "q13",
    question: "2026 对 step.jad 的最大期待",
    optionA: "高产似劳模，快发新专辑",
    optionB: "多开巡演，我要冲去现场",
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
    <div className="h-screen overflow-y-auto bg-gray-900/75">
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
