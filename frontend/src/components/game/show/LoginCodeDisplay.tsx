"use client";

import { useEffect, useState } from "react";

export interface LoginCodeState {
  code: string;
  expiresAt: number;
}

interface LoginCodeDisplayProps {
  active: boolean;
  loginCode: LoginCodeState | null;
}

export default function LoginCodeDisplay({ active, loginCode }: LoginCodeDisplayProps) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!loginCode || !active) {
      setSecondsLeft(0);
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((loginCode.expiresAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
    };

    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [loginCode, active]);

  if (!active) {
    return null;
  }

  if (!loginCode || secondsLeft <= 0) {
    return (
      <div className="theme-panel-strong p-16 text-center">
        <p className="text-4xl font-bold text-gray-700">等待管理员发布登录码</p>
      </div>
    );
  }

  return (
    <div className="theme-panel-strong p-12 text-center space-y-8">
      <p className="text-4xl font-bold text-gray-800">请在 {secondsLeft} 秒内输入登录码</p>
      <div className="theme-font-display text-[8rem] leading-none font-bold tracking-[0.2em] text-gray-900">
        {loginCode.code}
      </div>
      <p className="text-2xl text-gray-600">国区 → 输入上方 6 位登录码 → 进入游戏</p>
    </div>
  );
}
