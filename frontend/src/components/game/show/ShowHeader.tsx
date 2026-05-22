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
      <div className="theme-toolbar-chip">
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
            : "theme-icon-btn"
        }`}
        title={soundEnabled ? "暂停音乐" : "播放音乐"}
      >
        {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
      </button>
      <button
        onClick={onShowQRCode}
        className="theme-icon-btn"
        title="显示二维码"
      >
        <QrCode className="w-5 h-5" />
      </button>
      <button
        onClick={onLogout}
        className="theme-icon-btn-danger"
        title="退出"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
}
