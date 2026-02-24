"use client";

import { Clock, UserX, Crown, Trophy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserGameState } from "@/types";
import Image from "next/image";

interface GameStatusCardProps {
  userGameState: UserGameState;
  selectedOption: "A" | "B" | "";
  eliminatedReason: "no_answer" | "majority_choice" | null;
  onSubmitAnswer: (answer: "A" | "B") => void;
}

export default function GameStatusCard({
  userGameState,
  selectedOption,
  eliminatedReason,
  onSubmitAnswer,
}: GameStatusCardProps) {
  return (
    <main className="w-full h-auto px-8 py-12 items-center justify-center flex fixed top-[50vh] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-50/25">
      {userGameState.status === "waiting" && (
        <div className="text-center space-y-6">
          <Image
            src="/waitma.gif"
            alt="等待中"
            width={160}
            height={160}
            className="mx-auto"
          />
          <p className="text-gray-800 text-3xl font-bold tracking-wider">
            等待发布中...
          </p>
          <p className="text-gray-600 text-lg">请耐心等待题目发布</p>
        </div>
      )}

      {/* User Status */}
      {userGameState.status === "eliminated" && (
        <div className="text-center space-y-4">
          <p className="text-gray-800 text-3xl font-bold tracking-wider">
            您已被淘汰!
          </p>
          {eliminatedReason && (
            <p className="text-gray-600 text-lg font-semibold">
              原因：{eliminatedReason === "no_answer"
                ? "您未在规定时间内选择"
                : eliminatedReason === "majority_choice"
                ? "您选择了多数的选项"
                : eliminatedReason}
            </p>
          )}
          <p className="text-gray-600 text-md">
            感谢您的参与，请继续观看其他玩家的比赛！
          </p>
        </div>
      )}

      {userGameState.status === "winner" && (
        <div className="text-center space-y-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-800 text-4xl font-semibold tracking-wider">
            恭喜您！
          </p>
          <p className="text-red-700 text-lg">
            您是本轮游戏的冠军，请上台领奖！
          </p>
        </div>
      )}

      {userGameState.status === "tie" && (
        <div className="text-center space-y-8">
          <p className="text-white text-4xl font-semibold tracking-wider">
            平局! 战斗爽！
          </p>
          <p className="text-white text-xl">
            恭喜您进入决赛圈，请上台进行最后对决！
          </p>
        </div>
      )}

      {/* Question Area */}
      {userGameState.status === "playing" && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center px-4 py-2 bg-gradient-primary text-gray-800 rounded-full text-2xl font-bold tracking-wider">
            第 {userGameState.round} 轮
          </div>

          <div className="flex flex-col items-center gap-3 justify-center">
            <button
              type="button"
              onClick={() => onSubmitAnswer("A")}
              disabled={!!selectedOption}
              className={`relative w-48 h-48 md:w-56 md:h-56 transition-all duration-200 rounded-lg overflow-hidden ${
                selectedOption && selectedOption !== "A" ? "opacity-50" : ""
              }`}
            >
              <Image
                src="/aoption.png"
                alt="选项 A"
                fill
                className="object-contain"
              />
            </button>

            <button
              type="button"
              onClick={() => onSubmitAnswer("B")}
              disabled={!!selectedOption}
              className={`relative w-48 h-48 md:w-56 md:h-56 transition-all duration-200 rounded-lg overflow-hidden ${
                selectedOption && selectedOption !== "B" ? "opacity-50" : ""
              }`}
            >
              <Image
                src="/boption.png"
                alt="选项 B"
                fill
                className="object-contain"
              />
            </button>
          </div>

          {selectedOption && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-800 bg-white/50 rounded-md p-2">
                <CheckCircle className="w-5 h-5" />
                <div className="font-medium text-gray-800">
                  您已选择选项 {selectedOption}，请等待结果...
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
