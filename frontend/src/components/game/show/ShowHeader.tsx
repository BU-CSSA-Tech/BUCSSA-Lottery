"use client";

import { useState, useRef, useEffect } from "react";
import { Wifi, WifiOff, QrCode, LogOut, Volume2, VolumeX } from "lucide-react";
import { Socket } from "socket.io-client";

interface ShowHeaderProps {
  socket: Socket | null;
  onShowQRCode: () => void;
  onLogout: () => void;
}

export default function ShowHeader({ socket, onShowQRCode, onLogout }: ShowHeaderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/bgm.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const toggleBGM = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying((prev) => !prev);
  };

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
        onClick={toggleBGM}
        className={`p-2 rounded-lg transition-all border shadow-sm ${
          isPlaying
            ? "bg-amber-100/75 border-amber-300/60 text-amber-700"
            : "bg-amber-50/50 hover:bg-amber-100/75 text-gray-700 border border-rose-200/60"
        }`}
        title={isPlaying ? "暂停背景音乐" : "播放背景音乐"}
      >
        {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
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
