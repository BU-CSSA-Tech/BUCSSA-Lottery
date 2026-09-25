"use client";

import { motion } from "framer-motion";
import { Trophy, UserX, Users, Clock } from "lucide-react";
import { GameState } from "@/types";
import { formatTime } from "@/lib/utils";
import AnimatedBarChart from "@/components/ui/animated-bar-chart";
import Image from "next/image";
import { getThemeFromEnv, getThemePack } from "@/lib/theme";

interface GameContentProps {
  gameState: GameState;
  frontendTimeLeft: number;
  winner: string | null;
  tie: string[] | null;
  updatedWinnerTie: boolean;
  hideTiePanel?: boolean;
}

export default function GameContent({
  gameState,
  frontendTimeLeft,
  winner,
  tie,
  updatedWinnerTie,
  hideTiePanel = false,
}: GameContentProps) {
  const pack = getThemePack();
  const isNailong = getThemeFromEnv() === "nailong";
  const isQuestionActive =
    gameState?.status === "playing" && !!gameState.currentQuestion;

  return (
    <div
      className={
        isQuestionActive
          ? "flex h-full min-h-0 w-full flex-1 flex-col gap-[3vh]"
          : "flex w-full flex-col items-center gap-8"
      }
    >
      {/* 游戏统计栏 - 胶囊状横向排列 */}
      {gameState && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex shrink-0 flex-wrap justify-center gap-3"
        >
          <div className="theme-pill !px-5 !py-[0.7vh]">
            <Trophy className="h-[1.1em] w-[1.1em] text-amber-600 shrink-0" />
            <span className="text-gray-800 font-semibold leading-none text-[clamp(0.95rem,1.8vh,1.35rem)]">第 {gameState.round} 轮</span>
          </div>
          <div className="theme-pill !px-5 !py-[0.7vh]">
            <div className="h-3 w-3 rounded-full bg-green-500 shrink-0" />
            <span className="text-gray-800 font-semibold leading-none text-[clamp(0.95rem,1.8vh,1.35rem)]">存活: {gameState.survivorsCount}</span>
          </div>
          <div className="theme-pill !px-5 !py-[0.7vh]">
            <UserX className="h-[1.1em] w-[1.1em] text-red-500 shrink-0" />
            <span className="text-gray-800 font-semibold leading-none text-[clamp(0.95rem,1.8vh,1.35rem)]">淘汰: {gameState.eliminatedCount}</span>
          </div>
          <div className="theme-pill !px-5 !py-[0.7vh]">
            <Users className="h-[1.1em] w-[1.1em] text-slate-600 shrink-0" />
            <span className="text-gray-800 font-semibold leading-none text-[clamp(0.95rem,1.8vh,1.35rem)]">总数: {(gameState.survivorsCount || 0) + (gameState.eliminatedCount || 0)}</span>
          </div>
          <div className="theme-pill !px-5 !py-[0.7vh]">
            <Clock className="h-[1.1em] w-[1.1em] text-slate-600 shrink-0" />
            <span className={`font-semibold leading-none text-[clamp(0.95rem,1.8vh,1.35rem)] ${frontendTimeLeft <= 10 ? "text-red-500 animate-pulse" : "text-gray-800"}`}>
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
          className="theme-panel flex min-h-0 w-full flex-1 flex-col justify-evenly px-8 py-[3vh]"
        >
          <div className="flex w-full shrink-0 flex-col items-center gap-[2.5vh] text-center">
            <div className="flex items-center gap-4 rounded-full bg-amber-100/80 px-8 py-[1vh]">
              <Trophy className="h-[1.2em] w-[1.2em] text-amber-700" />
              <p className="font-semibold leading-none text-gray-800 text-[clamp(1.25rem,2.8vh,2rem)]">
                第 {gameState.round} 题
              </p>
            </div>
            <h2 className="w-full font-light leading-tight text-gray-800 text-[clamp(2.5rem,6.5vh,4.5rem)]">
              {gameState.currentQuestion.question}
            </h2>
          </div>

          <div className="flex w-full shrink-0 flex-wrap items-center justify-center gap-6 md:gap-10">
            <div
              className={
                isNailong
                  ? "theme-show-option w-fit max-w-2xl rounded-2xl px-8 py-[2vh]"
                  : "w-fit max-w-2xl rounded-2xl border border-green-200/60 bg-green-50/90 px-8 py-[2vh]"
              }
            >
              <div className="flex items-center justify-center gap-5">
                {isNailong ? (
                  <p className="theme-show-option-letter shrink-0 font-bold !leading-none !text-[clamp(3rem,7vh,5rem)]">A</p>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-green-100 md:h-20 md:w-20">
                    <p className="font-bold text-green-600 !leading-none !text-[clamp(2rem,4.5vh,3.5rem)]">A</p>
                  </div>
                )}
                <p className="text-center font-medium leading-snug text-gray-800 text-[clamp(1.875rem,4vh,3rem)]">
                  {gameState.currentQuestion?.optionA}
                </p>
              </div>
            </div>

            <div
              className={
                isNailong
                  ? "theme-show-option w-fit max-w-2xl rounded-2xl px-8 py-[2vh]"
                  : "w-fit max-w-2xl rounded-2xl border border-red-200/60 bg-red-50/90 px-8 py-[2vh]"
              }
            >
              <div className="flex items-center justify-center gap-5">
                {isNailong ? (
                  <p className="theme-show-option-letter shrink-0 font-bold !leading-none !text-[clamp(3rem,7vh,5rem)]">B</p>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-red-100 md:h-20 md:w-20">
                    <p className="font-bold text-red-600 !leading-none !text-[clamp(2rem,4.5vh,3.5rem)]">B</p>
                  </div>
                )}
                <p className="text-center font-medium leading-snug text-gray-800 text-[clamp(1.875rem,4vh,3rem)]">
                  {gameState.currentQuestion?.optionB}
                </p>
              </div>
            </div>
          </div>

          <div className="flex w-full shrink-0 items-center justify-center text-center">
            <div
              className={
                isNailong
                  ? `theme-show-countdown flex items-center justify-center rounded-full border-4 font-bold !leading-none !text-[clamp(2.5rem,6.5vh,4.5rem)] h-[clamp(5rem,13vh,7.5rem)] w-[clamp(5rem,13vh,7.5rem)] ${
                      frontendTimeLeft <= 10 ? "theme-show-countdown-urgent animate-pulse" : ""
                    }`
                  : `flex items-center justify-center rounded-full border-4 font-bold !leading-none !text-[clamp(2.5rem,6.5vh,4.5rem)] h-[clamp(5rem,13vh,7.5rem)] w-[clamp(5rem,13vh,7.5rem)] ${
                      frontendTimeLeft <= 10
                        ? "animate-pulse border-red-400/60 bg-red-50/80 text-red-500"
                        : "border-amber-400/60 bg-amber-50/80 text-amber-600"
                    }`
              }
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
          className="theme-panel shadow-red-down flex items-center justify-center gap-16 px-2 py-12"
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
          {pack.waitingDecor && (
            <div className="flex-shrink-0 w-36 h-36 md:w-44 md:h-44 flex items-center justify-center">
              <Image src={pack.waitingDecor} alt="dog" width={176} height={176} className="object-contain" />
            </div>
          )}
        </motion.div>
      )}

      {/* 游戏结束 */}
      {gameState.status === "ended" && !(hideTiePanel && tie && !winner) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="theme-panel p-12 text-center"
        >
          {!winner && !tie && (
            <>
              <div className="w-24 h-24 bg-yellow-500/30 rounded-full flex items-center justify-center mx-auto mb-8">
                <Trophy className="w-12 h-12 text-yellow-500" />
              </div>
              <h2 className="text-5xl font-bold mb-8 text-gray-800">
                游戏结 束!
              </h2>
            </>
          )}

          {winner ? (
            <div className="space-y-8 max-w-6xl mx-auto px-16 py-8">
              <div
                className={
                  isNailong
                    ? "text-6xl font-bold theme-title"
                    : "text-6xl text-white font-bold"
                }
                style={
                  isNailong
                    ? undefined
                    : { WebkitTextStroke: "4px #000", paintOrder: "stroke fill" }
                }
              >
                恭喜一等奖获得者!
              </div>
              <div className="relative flex justify-center">
                {pack.winBg ? (
                  <>
                    <Image
                      src={pack.winBg}
                      alt=""
                      width={700}
                      height={350}
                      className="max-w-full h-auto object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className={
                          isNailong
                            ? "text-6xl font-bold text-center text-black"
                            : "text-6xl font-bold text-center text-white"
                        }
                        style={
                          isNailong
                            ? undefined
                            : { WebkitTextStroke: "4px #000", paintOrder: "stroke fill" }
                        }
                      >
                        {winner}
                      </div>
                    </div>
                  </>
                ) : (
                  <div
                    className={
                      isNailong
                        ? "text-6xl font-bold text-center text-black"
                        : "text-6xl font-bold text-center text-white"
                    }
                    style={
                      isNailong
                        ? undefined
                        : { WebkitTextStroke: "4px #000", paintOrder: "stroke fill" }
                    }
                  >
                    {winner}
                  </div>
                )}
              </div>
            </div>
          ) : tie ? (
            <div className="space-y-16 max-w-6xl mx-auto p-16">
              <div
                className={
                  isNailong
                    ? "text-5xl font-bold mb-4 theme-title whitespace-nowrap"
                    : "text-5xl text-red-700 font-bold mb-4 whitespace-nowrap"
                }
              >
                请两位选手上台PK, 竞争最终大奖!
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <div className="theme-panel-strong text-gray-800 px-12 py-8 rounded-3xl border-2 border-white/75">
                  <div className="text-3xl font-bold mb-4 text-center">
                    选手 1
                  </div>
                  <div
                    className={`${isNailong ? "text-2xl" : "text-4xl"} font-light text-center overflow-x-auto`}
                  >
                    {tie[0]}
                  </div>
                </div>

                <div className="theme-panel-strong text-gray-800 px-12 py-8 rounded-3xl border-2 border-white/75">
                  <div className="text-3xl font-bold mb-4 text-center">
                    选手 2
                  </div>
                  <div
                    className={`${isNailong ? "text-2xl" : "text-4xl"} font-light text-center overflow-x-auto`}
                  >
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
          className="theme-panel p-16 text-center"
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
            className="w-full max-w-4xl mx-auto px-8 py-8 items-center justify-center flex fixed top-[40vh] left-1/2 -translate-x-1/2 -translate-y-1/2 theme-panel-strong z-20"
          >
            <div className="text-center space-y-6 w-full">
              {/* 存活答案标题 */}
              <div className="space-y-4">
                {
                  ((gameState?.answers?.A ?? 0) !== 0 && (gameState?.answers?.B ?? 0) !== 0) && (gameState?.answers?.A !== gameState?.answers?.B ) && 
                  (
                    <h2 className="text-amber-800 text-2xl font-bold tracking-wider">
                    本轮存活答案
                    </h2>
                  )
                }

                <div className="text-5xl font-bold text-amber-600">
                  {(gameState?.answers?.A ?? 0) === 0 && (gameState?.answers?.B ?? 0) === 0
                    ? "无人作答"
                    : (gameState?.answers?.A ?? 0) < (gameState?.answers?.B ?? 0)
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
