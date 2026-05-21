"use client";

import Image from "next/image";
import { Wifi, WifiOff, RotateCcw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  connected: boolean;
  loading: boolean;
  loginCodeStatus: "idle" | "published" | "expired";
  publishingCode: boolean;
  onPublishLoginCode: () => void;
  onResetGame: () => void;
  onShowLogoutConfirm: () => void;
}

export default function AdminHeader({
  connected,
  loading,
  loginCodeStatus,
  publishingCode,
  onPublishLoginCode,
  onResetGame,
  onShowLogoutConfirm,
}: AdminHeaderProps) {
  return (
    <header className="glass-dark border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-primary rounded-xl flex items-center justify-center">
              <Image
                src="/bucssalogo.png"
                alt="logo"
                width={48}
                height={48}
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">
                BUCSSA 新春嘉年华 抽奖 - 管理控制台
              </h1>
              <div className="flex items-center gap-1">
                {connected ? (
                  <Wifi className="w-4 h-4 text-green-400" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-400" />
                )}
                <span
                  className={`text-xs font-medium ${
                    connected ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {connected ? "已连接" : "连接中..."}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <div className="flex flex-col items-end mr-2">
              <Button
                onClick={onPublishLoginCode}
                disabled={loading || publishingCode}
                className="h-9 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg font-medium text-sm"
              >
                {publishingCode ? "发布中..." : "发布登录码"}
              </Button>
              {loginCodeStatus === "published" && (
                <span className="text-xs text-emerald-400 mt-1">已发布，请查看投屏</span>
              )}
              {loginCodeStatus === "expired" && (
                <span className="text-xs text-amber-400 mt-1">登录码已过期</span>
              )}
            </div>
            <Button
              onClick={onResetGame}
              disabled={loading}
              variant="destructive"
              className="h-9 px-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-lg font-medium transition-all duration-200 hover-lift text-sm"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              重置游戏
            </Button>

            <Button
              onClick={onShowLogoutConfirm}
              className="h-9 px-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-lg font-medium transition-all duration-200 hover-lift"
            >
              <LogOut className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
