"use client";

import { motion } from "framer-motion";
import { Trophy, User, UserX, Users, Clock } from "lucide-react";
import { GameState } from "@/types";
import { formatTime } from "@/lib/utils";
import AnimatedBarChart from "@/components/ui/animated-bar-chart";

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
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* 游戏统计面板 */}
      {gameState && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-6"
        >
          <div className="border border-white/50 rounded-md bg-white/25 backdrop-blur-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Trophy className="w-8 h-8 text-blue-400" />
              </div>
              <div className="space-y-2">
                <p className="text-5xl font-bold text-center text-white">
                  {gameState.round}
                </p>
                <p className="text-gray-800 text-base font-semibold">
                  当前轮次
                </p>
              </div>
            </div>
          </div>

          <div className="border border-white/50 rounded-md bg-white/25 backdrop-blur-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center">
                <User className="w-8 h-8 text-green-400" />
              </div>
              <div className="space-y-2">
                <p className="text-5xl font-bold text-center text-white">
                  {gameState.survivorsCount}
                </p>
                <p className="text-gray-800 text-base font-semibold">
                  存活人数
                </p>
              </div>
            </div>
          </div>

          <div className="border border-white/50 rounded-md bg-white/25 backdrop-blur-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center">
                <UserX className="w-8 h-8 text-red-400" />
              </div>
              <div className="space-y-2">
                <p className="text-5xl font-bold text-center text-white">
                  {gameState.eliminatedCount}
                </p>
                <p className="text-gray-800 text-base font-semibold">
                  淘汰人数
                </p>
              </div>
            </div>
          </div>

          <div className="border border-white/50 rounded-md bg-white/25 backdrop-blur-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-8 h-8 text-purple-400" />
              </div>
              <div className="space-y-2">
                <p className="text-5xl font-bold text-center text-white">
                  {(gameState.survivorsCount || 0) +
                    (gameState.eliminatedCount || 0)}
                </p>
                <p className="text-gray-800 text-base font-semibold">
                  总参与人数
                </p>
              </div>
            </div>
          </div>

          <div className="border border-white/50 rounded-md bg-white/25 backdrop-blur-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-8 h-8 text-orange-400" />
              </div>
              <div className="space-y-2">
                <p
                  className={`text-5xl font-bold text-center ${
                    frontendTimeLeft <= 10
                      ? "text-red-500 animate-pulse"
                      : "text-white"
                  }`}
                >
                  {formatTime(frontendTimeLeft)}
                </p>
                <p className="text-gray-800 text-base font-semibold text-center">
                  剩余时间
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 当前题目显示 */}
      {gameState.currentQuestion && gameState.status === "playing" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border border-white/50 rounded-md bg-white/25 backdrop-blur-sm p-8 space-y-8"
        >
          <div className="text-center mb-8 flex flex-col items-center justify-center space-y-8">
            <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm rounded-md p-4">
              <Trophy className="w-6 h-6 text-gray-800 font-light" />
              <p className="text-gray-800 text-2xl font-light">
                第 {gameState.round} 题
              </p>
            </div>
            <h2 className="text-6xl font-light text-gray-800">
              {gameState.currentQuestion.question}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-7xl mx-auto">
            <div className="border border-white/50 rounded-md backdrop-blur-sm p-8 bg-green-200/25">
              <div className="flex items-center gap-4 justify-center">
                <div className="w-12 h-12 rounded-md flex items-center justify-center">
                  <p className="font-normal text-6xl text-green-400">A</p>
                </div>
                <p className="text-gray-800 text-5xl font-light">
                  {gameState.currentQuestion?.optionA}
                </p>
              </div>
            </div>

            <div className="border border-white/50 rounded-md  backdrop-blur-sm p-8 bg-red-200/25">
              <div className="flex items-center gap-4 justify-center">
                <div className="w-12 h-12 rounded-md flex items-center justify-center">
                  <p className="font-normal text-6xl text-red-400">B</p>
                </div>
                <p className="text-gray-800 text-5xl font-light">
                  {gameState.currentQuestion?.optionB}
                </p>
              </div>
            </div>
          </div>

          {/* 倒计时 */}
          <div className="text-center flex items-center justify-center">
            <div className="relative">
              {/* 圆形包裹背景 */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-full blur-xl scale-110"></div>
              <div className="absolute inset-0 bg-white/20 rounded-full"></div>

              {/* 倒计时数字 */}
              <div
                className={`relative text-9xl font-bold bg-white/50 backdrop-blur-sm rounded-full w-48 h-48 flex items-center justify-center border-4 ${
                  frontendTimeLeft <= 10
                    ? "text-red-500 animate-pulse border-red-400/50"
                    : "text-yellow-400 border-yellow-400/50"
                }`}
              >
                {Math.max(0, frontendTimeLeft)}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 等待状态 */}
      {gameState.status === "waiting" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-white/50 rounded-md bg-white/25 backdrop-blur-sm p-6 text-center"
        >
          <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <Trophy className="w-12 h-12 text-blue-400" />
          </div>
          <h3 className="text-4xl font-bold text-gray-800 mb-6">
            游戏准备中
          </h3>
          <p className="text-xl text-gray-700 mb-4">
            等待管理员开始游戏...
          </p>
          {gameState.survivorsCount + gameState.eliminatedCount > 0 && (
            <p className="text-lg text-gray-500">
              当前已有{" "}
              {gameState.survivorsCount + gameState.eliminatedCount}{" "}
              名玩家加入
            </p>
          )}
        </motion.div>
      )}

      {/* 游戏结束 */}
      {gameState.status === "ended" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border border-white/50 rounded-md bg-white/25 backdrop-blur-sm p-12 text-center"
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
                请两位选手上台PK, 竞争第一名!
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <div className="bg-green-500/75 text-white px-12 py-8 rounded-3xl border-2 border-white/75">
                  <div className="text-4xl font-bold mb-4 text-center">
                    选手 1
                  </div>
                  <div className="text-3xl font-light text-center break-words">
                    {tie[0]}
                  </div>
                </div>

                <div className="bg-red-500/75 text-white px-12 py-8 rounded-3xl border-2 border-white/75">
                  <div className="text-4xl font-bold mb-4 text-center">
                    选手 2
                  </div>
                  <div className="text-3xl font-light text-center break-words">
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
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-16 text-center"
        >
          <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-4xl font-bold mb-6 text-white">
            连接游戏服务器中
          </h2>
          <p className="text-xl text-gray-300">正在获取游戏状态...</p>
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
            className="w-full max-w-4xl mx-auto px-8 py-8 items-center justify-center flex fixed top-[40vh] left-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/50 rounded-md bg-white/25 backdrop-blur-sm"
          >
            <div className="text-center space-y-6 w-full">
              {/* 存活答案标题 */}
              {(() => {
                const answerA = gameState?.answers?.A ?? 0;
                const answerB = gameState?.answers?.B ?? 0;

                if (answerA === 0 && answerB === 0) {
                  return (
                    <div className="space-y-4">
                      <h2 className="text-yellow-900 text-2xl font-bold tracking-wider">
                        无人作答
                      </h2>
                    </div>
                  );
                } else if (answerA === 0 || answerB === 0) {
                  return (
                    <div className="space-y-4">
                      <h2 className="text-yellow-900 text-2xl font-bold tracking-wider">
                        全员存活
                      </h2>
                    </div>
                  );
                } else if (answerA === answerB) {
                  return (
                    <div className="space-y-4">
                      <h2 className="text-yellow-900 text-2xl font-bold tracking-wider">
                        平局
                      </h2>
                    </div>
                  );
                } else if (answerA < answerB) {
                  return (
                    <div className="space-y-4">
                      <h2 className="text-yellow-900 text-2xl font-bold tracking-wider">
                        本轮存活答案
                      </h2>
                      <div className="text-5xl font-bold text-yellow-600">A</div>
                    </div>
                  );
                } else {
                  return (
                    <div className="space-y-4">
                      <h2 className="text-yellow-900 text-2xl font-bold tracking-wider">
                        本轮存活答案
                      </h2>
                      <div className="text-5xl font-bold text-yellow-600">B</div>
                    </div>
                  );
                }
              })()}

              {/* 选择统计柱状图 */}
              <div className="my-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
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
