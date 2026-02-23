"use client";

import { Wifi, WifiOff, User, LogOut } from "lucide-react";
import { Session } from "next-auth";
import Image from "next/image";

interface PlayHeaderProps {
  connected: boolean;
  session: Session | null;
  onLogout: () => void;
}

export default function PlayHeader({ connected, session, onLogout }: PlayHeaderProps) {
  return (
    <header className="sticky top-0 z-50 md:px-16 px-4 py-3 bg-white/25 backdrop-blur-sm border-b border-white/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center ml-2">
          <Image src="/bucssalogo.png" alt="logo" width={64} height={64} />
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/50 rounded-full p-2">
            {connected ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
          </div>
          <div className="text-right text-black bg-white/50 rounded-full p-2">
            <p className="text-sm text-gray-800">
              <User className="inline w-5 h-5 text-gray-800" />
              {session?.user?.email
                ? session.user.email.slice(0, 5) + "***"
                : ""}
            </p>
          </div>
          <div
            className="text-gray-800 cursor-pointer p-2 bg-white/50 hover:bg-white/75 rounded-md transition-all duration-300"
            onClick={onLogout}
          >
            <LogOut className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
