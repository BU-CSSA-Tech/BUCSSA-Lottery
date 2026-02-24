"use client";

import { Wifi, WifiOff, QrCode, LogOut } from "lucide-react";
import { Socket } from "socket.io-client";

interface ShowHeaderProps {
  socket: Socket | null;
  onShowQRCode: () => void;
  onLogout: () => void;
}

export default function ShowHeader({ socket, onShowQRCode, onLogout }: ShowHeaderProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50/95 border border-rose-200/60 shadow-sm">
        {socket ? (
          <Wifi className="w-5 h-5 text-green-600" />
        ) : (
          <WifiOff className="w-5 h-5 text-red-500" />
        )}
      </div>
      <button
        onClick={onShowQRCode}
        className="p-2 rounded-lg bg-amber-50/95 hover:bg-amber-100/95 text-gray-700 transition-all border border-rose-200/60 shadow-sm"
        title="显示二维码"
      >
        <QrCode className="w-5 h-5" />
      </button>
      <button
        onClick={onLogout}
        className="p-2 rounded-lg bg-amber-50/95 hover:bg-red-200/90 text-red-600 transition-all border border-red-200/60 shadow-sm"
        title="退出"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
}
