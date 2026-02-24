"use client";

import { Clock, UserX, Crown, Trophy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserGameState } from "@/types";

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
    <main className="w-full h-auto px-8 py-8 items-center justify-center flex fixed top-[40vh] left-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/50 rounded-md bg-white/25 backdrop-blur-sm">
      {userGameState.status === "waiting" && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-blue-900 text-3xl font-bold tracking-wider">
            等待发布中...
          </p>
          <p className="text-blue-600 text-lg">请耐心等待题目发布</p>
        </div>
      )}

      {/* User Status */}
      {userGameState.status === "eliminated" && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserX className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-800 text-3xl font-bold tracking-wider">
            您已被淘汰!
          </p>
          {eliminatedReason && (
            <p className="text-red-600 text-lg font-semibold">
              原因：{eliminatedReason === "no_answer"
                ? "您未在规定时间内选择"
                : eliminatedReason === "majority_choice"
                ? "您选择了多数的选项"
                : eliminatedReason}
            </p>
          )}
          <p className="text-red-600 text-lg">
            感谢您的参与，请继续观看其他玩家的比赛！
          </p>
        </div>
      )}

      {userGameState.status === "winner" && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-green-900 text-3xl font-bold tracking-wider">
            恭喜您！
          </p>
          <p className="text-green-700 text-lg">
            您是本轮游戏的冠军，请上台领奖！
          </p>
        </div>
      )}

      {userGameState.status === "tie" && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-yellow-900 text-3xl font-bold tracking-wider">
            平局出现!
          </p>
          <p className="text-yellow-700 text-lg">
            恭喜您进入决赛圈，请上台进行最后对决！
          </p>
        </div>
      )}

      {/* Question Area */}
      {userGameState.status === "playing" && (
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="flex items-center px-4 py-2 bg-gradient-primary text-gray-800 rounded-full text-2xl font-bold tracking-wider">
            第 {userGameState.round} 轮
          </div>

          <div className="flex flex-col items-center gap-4 justify-center">
            <Button
              onClick={() => onSubmitAnswer("A")}
              disabled={!!selectedOption}
              size="lg"
              className={`p-6 w-64 h-32 ${
                selectedOption === "A"
                  ? "border-green-500 border-4 bg-green-300/50 text-green-500 text-5xl font-bold"
                  : "border-white/50 bg-green-100 hover:bg-green-200 text-green-600 text-5xl font-bold"
              }`}
            >
              A
            </Button>

            <Button
              onClick={() => onSubmitAnswer("B")}
              disabled={!!selectedOption}
              size="lg"
              className={`p-6 w-64 h-32 ${
                selectedOption === "B"
                  ? "border-red-500 border-4 bg-red-300/50 text-red-500 text-5xl font-bold"
                  : "border-white/50 bg-red-100 hover:bg-red-200 text-red-600 text-5xl font-bold"
              }`}
            >
              B
            </Button>
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
