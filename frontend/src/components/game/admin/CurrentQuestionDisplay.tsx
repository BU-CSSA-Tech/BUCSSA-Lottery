"use client";

import { Zap } from "lucide-react";
import { GameState } from "@/types";

interface CurrentQuestionDisplayProps {
  gameState: GameState;
}

export default function CurrentQuestionDisplay({ gameState }: CurrentQuestionDisplayProps) {
  return (
    <div className="glass rounded-2xl p-5 animate-slide-up">
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-primary rounded-full text-white font-medium mb-4 text-sm">
          <Zap className="w-3 h-3" />第 {gameState.round} 题
        </div>
        <h2 className="text-xl font-bold text-white mb-4">
          {gameState.currentQuestion!.question}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-dark rounded-xl p-4 border border-white/20 hover:border-white/30 transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <p className="text-white text-sm font-medium">
              {gameState.currentQuestion!.optionA}
            </p>
          </div>
        </div>

        <div className="glass-dark rounded-xl p-4 border border-white/20 hover:border-white/30 transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <p className="text-white text-sm font-medium">
              {gameState.currentQuestion!.optionB}
            </p>
          </div>
        </div>
      </div>

      {/* Round Statistics */}
      <div className="mt-4 p-4 bg-white/5 rounded-xl">
        <h4 className="text-sm font-bold text-white mb-3">
          当前轮次统计
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-400">
              {gameState?.answers?.A}
            </div>
            <div className="text-gray-400 text-xs">选择 A</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-400">
              {gameState?.answers?.B}
            </div>
            <div className="text-gray-400 text-xs">选择 B</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-red-400">
              {(gameState?.answers?.A || 0) +
                (gameState?.answers?.B || 0) -
                ((gameState?.answers?.A || 0) +
                  (gameState?.answers?.B || 0))}
            </div>
            <div className="text-gray-400 text-xs">未答题</div>
          </div>
        </div>
      </div>
    </div>
  );
}
