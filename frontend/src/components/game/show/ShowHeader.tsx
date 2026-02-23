"use client";

import { Wifi, WifiOff, QrCode, LogOut } from "lucide-react";
import { Socket } from "socket.io-client";
import Image from "next/image";

interface ShowHeaderProps {
  socket: Socket | null;
  onShowQRCode: () => void;
  onLogout: () => void;
}

export default function ShowHeader({ socket, onShowQRCode, onLogout }: ShowHeaderProps) {
  return (
    <div className="bg-black/10 backdrop-blur-sm border-b border-white/20 border-b">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between w-full px-4">
            <div className="flex items-center gap-4">
              <Image
                src="/bucssalogo.png"
                alt="logo"
                width={64}
                height={64}
              />
              <h1 className="text-3xl font-light tracking-wider">
                BUCSSA 国庆晚会抽奖
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {socket ? (
                  <Wifi className="w-7 h-7 text-green-400" />
                ) : (
                  <WifiOff className="w-7 h-7 text-red-400" />
                )}
              </div>
              <button
                onClick={onShowQRCode}
                className="hidden md:block p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 border border-white/20 hover:border-white/30"
                title="显示二维码"
              >
                <QrCode className="w-6 h-6" />
              </button>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-all duration-200 border border-red-500/30 hover:border-red-500/50"
                title="logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
