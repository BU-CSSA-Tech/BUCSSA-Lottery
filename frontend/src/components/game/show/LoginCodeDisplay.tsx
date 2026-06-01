"use client";

import { Users } from "lucide-react";

export interface LoginCodeState {
  code: string;
}

interface LoginCodeDisplayProps {
  active: boolean;
  loginCode: LoginCodeState | null;
  totalPlayers: number;
}

export default function LoginCodeDisplay({ active, loginCode, totalPlayers }: LoginCodeDisplayProps) {
  if (!active) {
    return null;
  }

  if (!loginCode) {
    return (
      <div className="theme-panel-strong p-16 text-center">
        <p className="text-4xl font-bold text-gray-700">等待管理员发布登录码</p>
      </div>
    );
  }

  return (
    <div className="theme-panel-strong p-12 text-center space-y-8">
      <p className="text-4xl font-bold text-gray-800">请输入当前登录码进入游戏</p>
      <div className="theme-font-display text-[8rem] leading-none font-bold tracking-[0.2em] text-gray-900">
        {loginCode.code}
      </div>
      <p className="text-2xl text-gray-600">输入上方 6 位登录码 → 进入游戏</p>
      <div className="flex justify-center">
        <div className="theme-pill">
          <Users className="w-6 h-6 text-slate-600 shrink-0" />
          <span className="text-gray-800 font-semibold text-2xl">当前已加入: {totalPlayers}</span>
        </div>
      </div>
    </div>
  );
}
