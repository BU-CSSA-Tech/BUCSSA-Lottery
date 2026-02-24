"use client";

import { Users, UserX, Target, Crown, Trophy, Clock, Activity } from "lucide-react";
import { GameState } from "@/types";

interface GameStatusPanelProps {
  gameState: GameState;
  winner: string | null;
  tie: string[] | null;
}

export default function GameStatusPanel({ gameState, winner, tie }: GameStatusPanelProps) {
  const getStatusColor = () => {
    switch (gameState?.status) {
      case "playing":
        return "from-green-500 to-emerald-500";
      case "ended":
        return "from-red-500 to-pink-500";
      default:
        return "from-blue-500 to-indigo-500";
    }
  };

  const getStatusIcon = () => {
    switch (gameState?.status) {
      case "playing":
        return <Activity className="w-6 h-6" />;
      case "ended":
        return <Crown className="w-6 h-6" />;
      default:
        return <Clock className="w-6 h-6" />;
    }
  };

  const getStatusText = () => {
    switch (gameState?.status) {
      case "playing":
        return "答题进行中";
      case "ended":
        return "游戏已结束";
      default:
        return "等待下一题";
    }
  };

  return (
    <>
      {/* Status Banner */}
      <div
        className={`glass rounded-2xl p-4 bg-gradient-to-r ${getStatusColor()} animate-fade-in`}
      >
        <div className="flex items-center justify-center gap-3 text-white">
          {getStatusIcon()}
          <span className="text-lg font-bold">{getStatusText()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-slide-up">
        <div className="glass rounded-xl p-4 hover-lift">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">
                {gameState?.survivorsCount}
              </p>
              <p className="text-gray-400 text-sm">存活人数</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-4 hover-lift">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <UserX className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">
                {gameState?.eliminatedCount}
              </p>
              <p className="text-gray-400 text-sm">淘汰人数</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-4 hover-lift">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">
                {gameState.survivorsCount ||
                  0 + gameState.eliminatedCount ||
                  0}
              </p>
              <p className="text-gray-400 text-sm">总参与人数</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-4 hover-lift">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Crown className="w-4 h-4 text-green-400" />
            </div>
            <div>
              {winner ? (
                <p className="text-md font-bold text-white">{winner}</p>
              ) : (
                <p className="text-white text-xl font-bold">暂无获胜玩家</p>
              )}
              <p className="text-gray-400 text-sm">获胜者</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-4 hover-lift">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Trophy className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              {tie ? (
                <p className="text-md font-bold text-white">
                  {tie.join(", ")}
                </p>
              ) : (
                <p className="text-white text-xl font-bold">暂无平手玩家</p>
              )}
              <p className="text-gray-400 text-sm">决赛圈</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
