"use client";

import { Wifi, WifiOff, QrCode, LogOut, Volume2, VolumeX } from "lucide-react";
import { Socket } from "socket.io-client";

interface ShowHeaderProps {
  socket: Socket | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onShowQRCode: () => void;
  onLogout: () => void;
}

export default function ShowHeader({ socket, soundEnabled, onToggleSound, onShowQRCode, onLogout }: ShowHeaderProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-amber-50/50 border border-rose-200/60 shadow-sm">
        {socket ? (
          <Wifi className="w-5 h-5 text-green-600" />
        ) : (
          <WifiOff className="w-5 h-5 text-red-500" />
        )}
      </div>
      <button
        onClick={onToggleSound}
        className={`p-2 rounded-lg transition-all border shadow-sm ${
          soundEnabled
            ? "bg-amber-100/75 border-amber-300/60 text-amber-700"
            : "bg-amber-50/50 hover:bg-amber-100/75 text-gray-700 border border-rose-200/60"
        }`}
        title={soundEnabled ? "暂停音乐" : "播放音乐"}
      >
        {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
      </button>
      <button
        onClick={onShowQRCode}
        className="p-2 rounded-lg bg-amber-50/50 hover:bg-amber-100/75 text-gray-700 transition-all border border-rose-200/60 shadow-sm"
        title="显示二维码"
      >
        <QrCode className="w-5 h-5" />
      </button>
      <button
        onClick={onLogout}
        className="p-2 rounded-lg bg-amber-50/50 hover:bg-red-200/75 text-red-600 transition-all border border-red-200/60 shadow-sm"
        title="退出"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
}
