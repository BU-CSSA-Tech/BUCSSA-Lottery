"use client";

import { motion } from "framer-motion";
import { Trophy, UserX, Users, Clock } from "lucide-react";
import { GameState } from "@/types";
import { formatTime } from "@/lib/utils";
import AnimatedBarChart from "@/components/ui/animated-bar-chart";
import Image from "next/image";

interface GameContentProps {
  gameState: GameState;
  frontendTimeLeft: number;
  winner: string | null;
  tie: string[] | null;
  updatedWinnerTie: boolean;
}

export default function GameContent({
  gameState,
  frontendTimeLeft,
  winner,
  tie,
  updatedWinnerTie,
}: GameContentProps) {
  return (
    <div className="w-full space-y-6">
      {/* 游戏统计栏 - 胶囊状横向排列 */}
      {gameState && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-12 mb-12"
        >
          <div className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-amber-50/95 border border-rose-200/60 shadow-red-down">
            <Trophy className="w-6 h-6 text-amber-600 shrink-0" />
            <span className="text-gray-800 font-semibold text-2xl">第 {gameState.round} 轮</span>
          </div>
          <div className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-amber-50/95 border border-rose-200/60 shadow-red-down">
            <div className="w-4 h-4 rounded-full bg-green-500 shrink-0" />
            <span className="text-gray-800 font-semibold text-2xl">存活: {gameState.survivorsCount}</span>
          </div>
          <div className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-amber-50/95 border border-rose-200/60 shadow-red-down">
            <UserX className="w-6 h-6 text-red-500 shrink-0" />
            <span className="text-gray-800 font-semibold text-2xl">淘汰: {gameState.eliminatedCount}</span>
          </div>
          <div className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-amber-50/95 border border-rose-200/60 shadow-red-down">
            <Users className="w-6 h-6 text-slate-600 shrink-0" />
            <span className="text-gray-800 font-semibold text-2xl">总数: {(gameState.survivorsCount || 0) + (gameState.eliminatedCount || 0)}</span>
          </div>
          <div className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-amber-50/95 border border-rose-200/60 shadow-red-down">
            <Clock className="w-6 h-6 text-slate-600 shrink-0" />
            <span className={`font-semibold text-2xl ${frontendTimeLeft <= 10 ? "text-red-500 animate-pulse" : "text-gray-800"}`}>
              {formatTime(frontendTimeLeft)}
            </span>
          </div>
        </motion.div>
      )}

      {/* 当前题目显示 */}
      {gameState.currentQuestion && gameState.status === "playing" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-amber-50/50 border border-rose-200/70 shadow-lg p-8 space-y-8"
        >
          <div className="text-center mb-8 flex flex-col items-center justify-center space-y-8">
            <div className="flex items-center gap-4 bg-amber-100/80 rounded-full px-5 py-2">
              <Trophy className="w-6 h-6 text-amber-700" />
              <p className="text-gray-800 text-2xl font-semibold">
                第 {gameState.round} 题
              </p>
            </div>
            <h2 className="text-6xl font-light text-gray-800">
              {gameState.currentQuestion.question}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="rounded-xl p-8 bg-green-50/90 border border-green-200/60">
              <div className="flex items-center gap-4 justify-center">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
                  <p className="font-bold text-4xl text-green-600">A</p>
                </div>
                <p className="text-gray-800 text-3xl md:text-4xl font-medium">
                  {gameState.currentQuestion?.optionA}
                </p>
              </div>
            </div>

            <div className="rounded-xl p-8 bg-red-50/90 border border-red-200/60">
              <div className="flex items-center gap-4 justify-center">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-red-100">
                  <p className="font-bold text-4xl text-red-600">B</p>
                </div>
                <p className="text-gray-800 text-3xl md:text-4xl font-medium">
                  {gameState.currentQuestion?.optionB}
                </p>
              </div>
            </div>
          </div>

          {/* 倒计时 */}
          <div className="text-center flex items-center justify-center">
            <div
              className={`text-8xl font-bold rounded-full w-40 h-40 flex items-center justify-center border-4 ${
                frontendTimeLeft <= 10
                  ? "text-red-500 animate-pulse border-red-400/60 bg-red-50/80"
                  : "text-amber-600 border-amber-400/60 bg-amber-50/80"
              }`}
            >
              {Math.max(0, frontendTimeLeft)}
            </div>
          </div>
        </motion.div>
      )}

      {/* 等待状态 */}
      {gameState.status === "waiting" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-amber-50/50 border border-rose-200/70 shadow-red-down px-2 py-12 flex items-center justify-center gap-16"
        >
          <div className="flex flex-col items-center gap-4 justify-center">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
              <h3 className="text-3xl font-bold text-gray-800 tracking-wider">
                游戏准备中
              </h3>
            </div>
            <p className="text-lg text-gray-600 text-center">
              请等待管理员开始抽奖...
            </p>
            {gameState.survivorsCount + gameState.eliminatedCount > 0 && (
              <p className="text-lg text-gray-500 text-center">
                当前已有 {gameState.survivorsCount + gameState.eliminatedCount} 位玩家加入
              </p>
            )}
          </div>
          <div className="flex-shrink-0 w-36 h-36 md:w-44 md:h-44 flex items-center justify-center">
            <Image src="/dog.webp" alt="dog" width={176} height={176} className="object-contain" />
          </div>
        </motion.div>
      )}

      {/* 游戏结束 */}
      {gameState.status === "ended" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-amber-50/50 border border-rose-200/70 shadow-lg p-12 text-center"
        >
          {!winner && !tie && (
            <>
              <div className="w-24 h-24 bg-yellow-500/30 rounded-full flex items-center justify-center mx-auto mb-8">
                <Trophy className="w-12 h-12 text-yellow-500" />
              </div>
              <h2 className="text-5xl font-bold mb-8 text-gray-800">
                游戏结束!
              </h2>
            </>
          )}

          {winner ? (
            <div className="space-y-16 max-w-6xl mx-auto p-16">
              <div className="text-6xl text-yellow-500/80 font-normal mb-4">
                恭喜一等奖获得者!
              </div>
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-2xl">
                <div className="text-6xl font-light">🏆 {winner} 🏆</div>
              </div>
            </div>
          ) : tie ? (
            <div className="space-y-16 max-w-6xl mx-auto p-16">
              <div className="text-5xl text-red-700 font-normal mb-4">
                请两位选手上台PK, 竞争最终大奖!
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <div className="bg-amber-50/95 text-gray-800 px-12 py-8 rounded-3xl border-2 border-white/75">
                  <div className="text-3xl font-bold mb-4 text-center">
                    选手 1
                  </div>
                  <div className="text-4xl font-light text-center overflow-x-auto">
                    {tie[0]}
                  </div>
                </div>

                <div className="bg-amber-50/95 text-gray-800 px-12 py-8 rounded-3xl border-2 border-white/75">
                  <div className="text-3xl font-bold mb-4 text-center">
                    选手 2
                  </div>
                  <div className="text-4xl font-light text-center overflow-x-auto">
                    {tie[1]}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden"></div>
          )}
        </motion.div>
      )}

      {/* 连接中状态 */}
      {!gameState && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-amber-50/50 border border-rose-200/70 shadow-lg p-16 text-center"
        >
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-4xl font-bold mb-6 text-gray-800">
            连接游戏服务器中
          </h2>
          <p className="text-xl text-gray-600">正在获取游戏状态...</p>
        </motion.div>
      )}

      {/* 在每局游戏中间展示本轮少数派答案和统计 */}
      {gameState &&
        gameState?.status === "waiting" &&
        gameState?.answers &&
        !winner &&
        !tie &&
        updatedWinnerTie && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto px-8 py-8 items-center justify-center flex fixed top-[40vh] left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-amber-50/95 border border-rose-200/70 shadow-xl z-20"
          >
            <div className="text-center space-y-6 w-full">
              {/* 存活答案标题 */}
              <div className="space-y-4">
                <h2 className="text-amber-800 text-2xl font-bold tracking-wider">
                  本轮存活答案
                </h2>
                <div className="text-5xl font-bold text-amber-600">
                  {(gameState?.answers?.A ?? 0) < (gameState?.answers?.B ?? 0)
                    ? "A"
                    : (gameState?.answers?.B ?? 0) < (gameState?.answers?.A ?? 0)
                    ? "B"
                    : "平局"}
                </div>
              </div>

              {/* 选择统计柱状图 */}
              <div className="my-8">
                <h3 className="text-xl font-bold text-gray-700 mb-6 text-center">
                  选择统计
                </h3>
                <AnimatedBarChart
                  data={[
                    {
                      label: "选择A人数",
                      value: Math.max(
                        0,
                        Number(gameState?.answers?.A) || 0
                      ),
                      color: "#1e40af",
                      bgColor: "#dbeafe",
                      borderColor: "#3b82f6",
                    },
                    {
                      label: "选择B人数",
                      value: Math.max(
                        0,
                        Number(gameState?.answers?.B) || 0
                      ),
                      color: "#be185d",
                      bgColor: "#fce7f3",
                      borderColor: "#ec4899",
                    },
                  ]}
                  maxValue={
                    Math.max(
                      Math.max(0, Number(gameState?.answers?.A) || 0),
                      Math.max(0, Number(gameState?.answers?.B) || 0)
                    ) || 1
                  }
                  duration={2}
                />
              </div>
            </div>
          </motion.div>
        )}
    </div>
  );
}
