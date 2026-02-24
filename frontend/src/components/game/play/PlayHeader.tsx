"use client";

import { useState } from "react";
import { Wifi, WifiOff, LogOut } from "lucide-react";
import { Session } from "next-auth";
import Image from "next/image";
import { AlertBox } from "@/components/ui/alert-box";

interface PlayHeaderProps {
  connected: boolean;
  session: Session | null;
  onLogout: () => void;
}

export default function PlayHeader({ connected, session, onLogout }: PlayHeaderProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <header className="sticky top-8 z-50 px-6 py-3">
      <div className="grid grid-cols-3 items-center">
        {/* 左侧：网络状态 + 用户名 */}
        <div className="flex items-center justify-start min-w-0">
          <div className="flex items-center gap-2 bg-white/50 rounded-full px-3 py-2 max-w-full min-w-0">
            {connected ? (
            <Wifi className="w-5 h-5 text-green-600 shrink-0" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500 shrink-0" />
            )}
          <span className="text-sm text-gray-800 truncate">
              {session?.user?.email ? session.user.email.slice(0, 5) + "***" : ""}
            </span>
          </div>
        </div>

        {/* 中间：Logo 始终居中 */}
        <div className="flex justify-center">
          <Image src="/bucssalogo.png" alt="logo" width={64} height={64} className="shrink-0" />
        </div>

        {/* 右侧：退出按钮 */}
        <div className="flex justify-end">
          <button
            type="button"
            className="text-gray-800 cursor-pointer p-2 bg-white/50 hover:bg-white/75 rounded-md transition-all duration-300 flex items-center gap-1.5"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">退出</span>
          </button>
        </div>
      </div>

      <AlertBox
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={onLogout}
        title="确认退出"
        message="游戏过程中请谨慎退出，确定要退出吗？"
        confirmText="退出"
        cancelText="取消"
        confirmVariant="destructive"
      />
    </header>
  );
}
