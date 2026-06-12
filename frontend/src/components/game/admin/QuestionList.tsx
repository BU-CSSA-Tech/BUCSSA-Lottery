"use client";

import { Button } from "@/components/ui/button";
import { GameState } from "@/types";

interface Question {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
}

interface QuestionListProps {
  questions: Question[];
  sentQuestions: Set<number>;
  gameState: GameState;
  loading: boolean;
  loginCodePublished: boolean;
  onSubmitQuestion: (index: number) => void;
}

export default function QuestionList({
  questions,
  sentQuestions,
  gameState,
  loading,
  loginCodePublished,
  onSubmitQuestion,
}: QuestionListProps) {
  return (
    <div className="theme-admin-panel">
      <div className="text-center mb-5">
        <h3 className="text-xl font-bold text-white mb-2">题目列表</h3>
        <p className="text-gray-400 text-md">
          共 {questions.length} 道题目，已发布 {sentQuestions.size}{" "}
          题
        </p>
        {loginCodePublished && (
          <p className="text-amber-400 text-sm mt-2">
            登录码开放中，请先关闭登录码后再发布题目
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3  overflow-y-auto">
        {questions.map((question, index) => {
          const isSent = sentQuestions.has(index);
          const isCurrentlyPlaying = gameState?.status === "playing";
          const isGameEnded = gameState?.status === "ended";
          const canPublish =
            !loading && !loginCodePublished && !isCurrentlyPlaying && !isGameEnded;

          return (
            <div
              key={question.id}
              className="theme-admin-question-item"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-md ${
                    isSent
                      ? "bg-green-500 text-white"
                      : "bg-gray-500 text-white"
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`text-md font-medium ${
                    isSent ? "text-green-400" : "text-gray-400"
                  }`}
                >
                  {isSent ? "已发布" : "待发布"}
                </span>
              </div>

              <h4 className="text-white font-medium mb-2 text-md leading-relaxed">
                {question.question}
              </h4>

              <div className="space-y-1 mb-3">
                <div className="flex items-center gap-1">
                  <span className="flex items-center justify-center text-md text-blue-400 font-bold">
                    A
                  </span>
                  <span className="text-gray-300 text-md truncate">
                    {question.optionA}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="flex items-center justify-center text-md text-pink-400 font-bold">
                    B
                  </span>
                  <span className="text-gray-300 text-md truncate">
                    {question.optionB}
                  </span>
                </div>
              </div>

              {/* 发布按钮 */}
              <div className="flex justify-center items-center">
                <Button
                  onClick={() => onSubmitQuestion(index)}
                  disabled={!canPublish}
                  size="sm"
                  className={`w-full text-md transition-all duration-200 ${
                    canPublish
                      ? isSent
                        ? "theme-btn-action-info"
                        : "theme-btn-action-success"
                      : "bg-gray-500/20 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isSent ? "重新发布" : "发布"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
