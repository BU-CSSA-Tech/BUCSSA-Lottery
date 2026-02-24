"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { GameState, hasWinner, hasTie } from "@/types";
import BackgroundImage from "@/components/ui/BackgroundImage";
import ConnectionFailedScreen from "@/components/game/show/ConnectionFailedScreen";
import WinnerModal from "@/components/game/show/WinnerModal";
import TieModal from "@/components/game/show/TieModal";
import ShowHeader from "@/components/game/show/ShowHeader";
import QRCodeModal from "@/components/game/show/QRCodeModal";
import GameContent from "@/components/game/show/GameContent";
import Confetti from "react-confetti";

export default function ShowPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>({
    round: 0,
    status: "waiting",
    currentQuestion: null,
    answers: { A: 0, B: 0 },
    survivorsCount: 0,
    eliminatedCount: 0,
    timeLeft: 0,
  });
  const [socket, setSocket] = useState<Socket | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [tie, setTie] = useState<string[] | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState<boolean>(false);
  const [showTieModal, setShowTieModal] = useState<boolean>(false);
  const [updatedWinnerTie, setUpdatedWinnerTie] = useState<boolean>(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [connectionFailed, setConnectionFailed] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  // 前端倒计时状态
  const [frontendTimeLeft, setFrontendTimeLeft] = useState<number>(0);
  const [countdownActive, setCountdownActive] = useState<boolean>(false);

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

    if (session.user.isAdmin) {
      router.push("/admin");
      return;
    }

    if (!session.user.isDisplay && !session.user.isAdmin) {
      router.push("/play");
      return;
    }
  }, []);

  // Socket.IO 连接
  useEffect(() => {
    if (status === "unauthenticated") {
      return;
    }

    if (!session?.user?.email) {
      return;
    }

    if (session.user.isAdmin) {
      return;
    }

    if (!session.user.isDisplay) {
      return;
    }

    if (!session.user.accessToken) {
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
      setSocket(socket);
    });

    socket.on("player_count_update", (data: GameState) => {
      console.log("📺 Received player_count:", data);
      setGameState((prev) => ({
        ...prev,
        survivorsCount: data.survivorsCount,
        eliminatedCount: data.eliminatedCount,
      }));
    });

    socket.on("countdown_update", (data: { timeLeft: number }) => {
      setFrontendTimeLeft(data.timeLeft);
      setCountdownActive(true);
    });

    socket.on("game_start", (data: GameState) => {
      console.log("📺 Received game_start:", data);
      setGameState(data);
      setWinner(null);
      setTie(null);
      setUpdatedWinnerTie(true);
    });

    socket.on("game_state", (data: GameState) => {
      console.log("📺 Received game_state:", data);
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
      console.log("📺 Received new_question:", data);
      // 避免在已结束（平局/冠军）时被新题目覆盖
      setGameState((prev) => (prev.status === "ended" ? prev : data));
      setFrontendTimeLeft(data.timeLeft ?? 0);
      setCountdownActive(true);
    });

    socket.on("round_result", (data: GameState) => {
      console.log("📺 Received round_result:", data);
      // 避免迟到的 round_result 覆盖已显示的平局/冠军（保持 ended 状态）
      setGameState((prev) => (prev.status === "ended" ? prev : data));
      setCountdownActive(false);
      setFrontendTimeLeft(0);
    });

    socket.on("tie", (data: hasTie) => {
      console.log("📺 Received game_tie:", data.finalists);
      if (data.finalists && data.finalists.length === 2) {
        setTie(data.finalists);
        setCountdownActive(false);
        setFrontendTimeLeft(0);
      }
      setUpdatedWinnerTie(true);
    });

    socket.on("winner", (data: hasWinner) => {
      console.log("📺 Received winner:", data.winnerEmail);
      setWinner(data.winnerEmail);
      setCountdownActive(false);
      setFrontendTimeLeft(0);
      setUpdatedWinnerTie(true);
    });

    socket.on("disconnect", () => {
      console.log("📺 Socket disconnected");
      setSocket(null);
    });

    socket.io.on("reconnect_failed", () => {
      console.log("📺 All reconnection attempts failed");
      socketRef.current = null;
      setConnectionFailed(true);
    });

    socket.io.on("reconnect_attempt", (attemptNumber) => {
      console.log(`📺 Reconnection attempt ${attemptNumber}/3`);
    });

    return () => {
      socket.disconnect();
    };
  }, [session]);

  // 前端倒计时逻辑
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (countdownActive && frontendTimeLeft > 0) {
      interval = setInterval(() => {
        setFrontendTimeLeft((prev) => {
          if (prev <= 1) {
            setCountdownActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [countdownActive, frontendTimeLeft]);

  // 管理全屏获胜者模态框
  useEffect(() => {
    if (winner) {
      setShowWinnerModal(true);
      const timer = setTimeout(() => {
        setShowWinnerModal(false);
      }, 180000);
      return () => clearTimeout(timer);
    } else {
      setShowWinnerModal(false);
    }
  }, [winner]);

  // 管理全屏平局模态框
  useEffect(() => {
    if (tie && tie.length >= 2) {
      setShowTieModal(true);
      const timer = setTimeout(() => {
        setShowTieModal(false);
      }, 180000);
      return () => clearTimeout(timer);
    } else {
      setShowTieModal(false);
    }
  }, [tie]);

  // 退出登录处理函数
  const handleLogout = async () => {
    try {
      if (socket) {
        socket.disconnect();
      }
      // 停止倒计时
      setCountdownActive(false);
      setFrontendTimeLeft(0);
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[url(/showbg.jpg)] bg-cover bg-center">
        <div className="text-gray-800 text-xl font-medium bg-amber-50/90 px-6 py-3 rounded-xl border border-rose-200/50">加载中...</div>
      </div>
    );
  }

  if (connectionFailed) {
    return <ConnectionFailedScreen />;
  }

  if (!session?.user?.isDisplay) {
    return null;
  }

  return (
    <>
      {/* 背景图片 */}
      <BackgroundImage
        imageUrl="/showbg.jpg"
        overlayOpacity={0.03}
        centerMask={false}
      />

      {/* 全屏获胜者模态框 */}
      {showWinnerModal && winner && (
        <WinnerModal winner={winner} onClose={() => setShowWinnerModal(false)} />
      )}

      {/* 全屏平局 VS 模态框 */}
      {showTieModal && tie && tie.length >= 2 && (
        <TieModal tie={tie} onClose={() => setShowTieModal(false)} />
      )}

      <div className="min-h-screen relative z-10 text-gray-800">
        {/* 全屏彩带效果 */}
        {winner && (
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

        {/* 顶部 Header - 连接状态、二维码、退出 */}
        <ShowHeader
          socket={socket}
          onShowQRCode={() => setShowQRCode(true)}
          onLogout={handleLogout}
        />

        {/* QR码弹窗 */}
        {showQRCode && (
          <QRCodeModal onClose={() => setShowQRCode(false)} />
        )}

        {/* 主内容区 - 始终居中显示 */}
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-6xl flex flex-col items-center gap-16">
            {/* 头部标题 */}
            <h1 className="text-6xl font-bold text-red-600 drop-shadow-sm tracking-wide text-center [-webkit-text-stroke:2px_white] [paint-order:stroke_fill]">
              BUCSSA 新春嘉年华 抽奖
            </h1>

            {/* 内容区 */}
            <GameContent
              gameState={gameState}
              frontendTimeLeft={frontendTimeLeft}
              winner={winner}
              tie={tie}
              updatedWinnerTie={updatedWinnerTie}
            />
          </div>
        </div>

          {/* Debug Section */}
        {/* <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-black/20 backdrop-blur-sm border border-yellow-400/50 rounded-lg p-4 mb-4">
            <h3 className="text-yellow-400 font-bold text-lg mb-3">
              🐛 Debug Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <div className="text-gray-300">
                  <span className="text-yellow-300">winner:</span>{" "}
                  {winner ? `"${winner}"` : "null"}
                </div>
                <div className="text-gray-300">
                  <span className="text-yellow-300">tie:</span>{" "}
                  {tie ? `[${tie.join(", ")}]` : "null"}
                </div>
                <div className="text-gray-300">
                  <span className="text-yellow-300">showWinnerModal:</span>{" "}
                  {showWinnerModal ? "true" : "false"}
                </div>
                <div className="text-gray-300">
                  <span className="text-yellow-300">showTieModal:</span>{" "}
                  {showTieModal ? "true" : "false"}
                </div>
                <div className="text-gray-300">
                  <span className="text-yellow-300">updatedWinnerTie:</span>{" "}
                  {updatedWinnerTie ? "true" : "false"}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-gray-300">
                  <span className="text-yellow-300">gameState.status:</span>{" "}
                  {gameState?.status || "null"}
                </div>
                <div className="text-gray-300">
                  <span className="text-yellow-300">gameState.round:</span>{" "}
                  {gameState?.round || "null"}
                </div>
                <div className="text-gray-300">
                  <span className="text-yellow-300">
                    gameState.survivorsCount:
                  </span>{" "}
                  {gameState?.survivorsCount || "null"}
                </div>
                <div className="text-gray-300">
                  <span className="text-yellow-300">
                    gameState.eliminatedCount:
                  </span>{" "}
                  {gameState?.eliminatedCount || "null"}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-gray-300">
                  <span className="text-yellow-300">frontendTimeLeft:</span>{" "}
                  {frontendTimeLeft}
                </div>
                <div className="text-gray-300">
                  <span className="text-yellow-300">countdownActive:</span>{" "}
                  {countdownActive ? "true" : "false"}
                </div>
                <div className="text-gray-300">
                  <span className="text-yellow-300">socket connected:</span>{" "}
                  {socket ? "true" : "false"}
                </div>
                <div className="text-gray-300">
                  <span className="text-yellow-300">answers A:</span>{" "}
                  {gameState?.answers?.A || "null"}
                </div>
                <div className="text-gray-300">
                  <span className="text-yellow-300">answers B:</span>{" "}
                  {gameState?.answers?.B || "null"}
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </>
  );
}
