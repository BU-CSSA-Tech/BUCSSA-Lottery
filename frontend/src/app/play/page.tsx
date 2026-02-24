"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Confetti from "react-confetti";
import BattleEffect from "@/components/ui/battle-effect";
import { io, Socket } from "socket.io-client";
import { useSession, signOut } from "next-auth/react";
import {
  UserGameState,
  isEliminatedPayload,
  isWinnerPayload,
  isTiePayload,
  isSocketErrorPayload,
} from "@/types";
import Image from "next/image";
import PlayHeader from "@/components/game/play/PlayHeader";
import GameStatusCard from "@/components/game/play/GameStatusCard";

export default function PlayPage() {
  const { data: session, status } = useSession();
  const [userGameState, setUserGameState] = useState<UserGameState>({
    status: "waiting",
    round: 0,
    userAnswer: null,
    timeLeft: 0,
  });
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "">("");
  const [connected, setConnected] = useState(false);
  const [eliminatedReason, setEliminatedReason] = useState<"no_answer" | "majority_choice" | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const router = useRouter();

  // 添加调试信息
  useEffect(() => {
    if (status === "unauthenticated") {
      console.log("Redirecting to login - unauthenticated");
      router.push("/login");
      return;
    }

    if (status === "loading") {
      return; // 等待认证状态
    }

    if (!session?.user?.email) {
      return;
    }

    if (session.user.isAdmin) {
      router.push("/admin");
      return;
    }

    if (session.user.isDisplay) {
      router.push("/show");
      return;
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      return;
    }

    if (!session?.user?.email) {
      return;
    }

    if (!session.user.accessToken) {
      // Token missing; user should re-authenticate
      return;
    }

    if (session.user.isAdmin) {
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
      // Debug: Check which transport is being used
      console.log("🔌 Connected via:", socket.io.engine.transport.name);
      socket.io.engine.on("upgrade", (transport) => {
        console.log("⬆️ Upgraded to:", transport.name);
      });
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("redirect", (data: { url: string; message: string }) => {
      console.log("Redirecting:", data);
      handleLogout();
    });

    socket.on("game_state", (data: UserGameState) => {
      console.log("game_state received:", data);
      // 已处于结束状态（平局/冠军/淘汰）时，不被迟到的 waiting/playing 覆盖
      setUserGameState((prev) => {
        const ended = ["tie", "winner", "eliminated"].includes(prev.status);
        const dataEnded = ["tie", "winner", "eliminated"].includes(data.status);
        if (ended && !dataEnded) return prev;
        return data;
      });
      setSelectedOption(data.userAnswer || "");
    });

    socket.on("game_start", (data: UserGameState) => {
      setUserGameState(data);
      setSelectedOption(data.userAnswer || "");
      if (data.status === "waiting") {
        window.location.reload();
      }
    });

    socket.on("new_question", (data: UserGameState) => {
      // 已处于结束状态时，不被迟到的 new_question 覆盖
      setUserGameState((prev) =>
        ["tie", "winner", "eliminated"].includes(prev.status) ? prev : data
      );
      setSelectedOption(data.userAnswer || "");
    });

    socket.on("round_result", (data: UserGameState) => {
      console.log("round_result received:", data);
      // 已处于结束状态时，不被迟到的 round_result（waiting）覆盖
      setUserGameState((prev) =>
        ["tie", "winner", "eliminated"].includes(prev.status) ? prev : data
      );
      setSelectedOption(data.userAnswer || "");
    });

    socket.on("eliminated", (data: unknown) => {
      if (!isEliminatedPayload(data)) {
        console.warn("eliminated: invalid payload", data);
        return;
      }
      const userElimination = data.eliminated.find((u) => u.userEmail === session.user?.email);
      if (userElimination) {
        setUserGameState((prev) => ({ ...prev, status: "eliminated" }));
        setEliminatedReason(userElimination.eliminatedReason);
      }
    });

    socket.on("winner", (data: unknown) => {
      if (!isWinnerPayload(data)) {
        console.warn("winner: invalid payload", data);
        return;
      }
      if (data.winnerEmail === session.user?.email) {
        setUserGameState((prev) => ({ ...prev, status: "winner" }));
      }
    });

    socket.on("tie", (data: unknown) => {
      if (!isTiePayload(data)) {
        console.warn("tie: invalid payload", data);
        return;
      }
      if (data.finalists.includes(session.user?.email ?? "")) {
        setUserGameState((prev) => ({ ...prev, status: "tie" }));
      }
    });

    socket.on("error", (data: unknown) => {
      if (isSocketErrorPayload(data)) {
        console.error("Socket 错误:", data.message ?? data.error, data);
      } else {
        console.error("Socket 错误:", data);
      }
    });

    return () => {
      console.log("disconnecting socket");
      socket.disconnect();
    };
  }, [session]);

  const handleSubmitAnswer = async (option: "A" | "B") => {
    if (userGameState.status === "eliminated" || selectedOption) return;

    try {
      setSelectedOption(option);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/submit-answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.accessToken || ""}`,
          },
          body: JSON.stringify({
            answer: option,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        `您选择了选项 ${option}，请等待结果...`;
      } else {
        data.error || "提交答案失败";
        setSelectedOption("");
      }
    } catch (error) {
      console.error("提交答案错误:", error);
      ("网络错误，请稍后重试");
      setSelectedOption("");
    }
  };

  const handleLogout = async () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    await signOut({ callbackUrl: "/login" });
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 spinner mx-auto mb-4"></div>
          <div className="text-muted">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relatives"
      style={{
        backgroundImage: "url(/playbg.png)",
        backgroundColor: "#c41e3a",
      }}
    >
      {/* 全屏彩带效果 */}
      {userGameState.status === "winner" && (
        <Confetti
          width={typeof window !== "undefined" ? window.innerWidth : 0}
          height={typeof window !== "undefined" ? window.innerHeight : 0}
          recycle={false}
          numberOfPieces={1000}
          gravity={0.3}
          initialVelocityY={20}
          initialVelocityX={5}
          colors={[
            "#FFD700",
            "#FFA500",
            "#FF8C00",
            "#FFB347",
            "#F4A460",
            "#DAA520",
            "#B8860B",
            "#CD853F",
            "#DEB887",
            "#F5DEB3",
            "#FFF8DC",
            "#FFE4B5",
            "#FFEFD5",
            "#FFFACD",
            "#FFFFE0",
            "#FFE135",
            "#FFD700",
            "#FFC107",
            "#FFB300",
            "#FFA000",
            "#FF8F00",
            "#FF6F00",
            "#FF5722",
            "#E65100",
            "#BF360C",
          ]}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 9999,
          }}
        />
      )}

      {/* 开战特效 */}
      <BattleEffect isActive={userGameState.status === "tie"} duration={3000} />

      {/* Header */}
      <PlayHeader connected={connected} session={session} onLogout={handleLogout} />

      {/* Game Status Cards */}
      <GameStatusCard
        userGameState={userGameState}
        selectedOption={selectedOption}
        eliminatedReason={eliminatedReason}
        onSubmitAnswer={handleSubmitAnswer}
      />
    </div>
  );
}
