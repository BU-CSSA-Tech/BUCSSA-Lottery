"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Swords } from "lucide-react";
import { createThemeAudio, getThemeFromEnv, getThemePack } from "@/lib/theme";

interface TieModalProps {
  tie: string[];
  onClose: () => void;
}

const TIE_SOUND_PLAYS = 3;

function useTieSound() {
  useEffect(() => {
    const audio = createThemeAudio(getThemePack().tie, { volume: 1 });
    if (!audio) return;

    let playCount = 0;

    const playNext = () => {
      if (playCount >= TIE_SOUND_PLAYS) return;
      playCount += 1;
      audio.play().catch(() => {});
    };

    const onEnded = () => {
      if (playCount < TIE_SOUND_PLAYS) playNext();
    };

    audio.addEventListener("ended", onEnded);
    playNext();

    return () => {
      audio.pause();
      audio.removeEventListener("ended", onEnded);
    };
  }, []);
}

function NailongTieContent({ tie }: { tie: string[] }) {
  return (
    <div className="relative flex flex-col items-center justify-center">
      <motion.div
        className="flex flex-col items-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
      >
        <span className="theme-nailong-tie-glow text-5xl lg:text-7xl font-bold tracking-wider">
          VS
        </span>
      </motion.div>

      <motion.div
        className="absolute right-full bottom-full mr-6 mb-6 space-y-4 text-right"
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <div className="theme-title text-5xl lg:text-6xl font-bold whitespace-nowrap">
          {tie[0] || ""}
        </div>
        <div className="theme-title text-3xl font-semibold">
          选手 1
        </div>
      </motion.div>

      <motion.div
        className="absolute left-full top-full ml-6 mt-6 space-y-4 text-left"
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <div className="theme-title text-5xl lg:text-6xl font-bold whitespace-nowrap">
          {tie[1] || ""}
        </div>
        <div className="theme-title text-3xl font-semibold">
          选手 2
        </div>
      </motion.div>
    </div>
  );
}

function DefaultTieContent({ tie }: { tie: string[] }) {
  return (
    <div className="relative flex flex-col items-center justify-center">
      <motion.div
        className="flex flex-col items-center gap-2"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
      >
        <Swords
          className="w-24 h-24 lg:w-32 lg:h-32 text-amber-400/90 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]"
          strokeWidth={1.5}
        />
        <span className="text-2xl lg:text-3xl font-bold text-amber-400/90 tracking-wider">
          V.S.
        </span>
      </motion.div>

      <motion.div
        className="absolute right-full bottom-full mr-6 mb-6 space-y-4 text-right overflow-x-auto"
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <motion.div
          className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-red-600 whitespace-nowrap overflow-x-auto"
          animate={{
            textShadow: [
              "0 0 20px #ef4444",
              "0 0 40px #dc2626",
              "0 0 20px #ef4444",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          {tie[0] || ""}
        </motion.div>
        <div className="text-3xl text-red-300 font-semibold">选手 1</div>
      </motion.div>

      <motion.div
        className="absolute left-full top-full ml-6 mt-6 space-y-4 text-left overflow-x-auto"
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <motion.div
          className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-500 to-green-600 whitespace-nowrap overflow-x-auto"
          animate={{
            textShadow: [
              "0 0 20px #22c55e",
              "0 0 40px #16a34a",
              "0 0 20px #22c55e",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          {tie[1] || ""}
        </motion.div>
        <div className="text-3xl text-green-300 font-semibold">选手 2</div>
      </motion.div>
    </div>
  );
}

export default function TieModal({ tie, onClose }: TieModalProps) {
  const isNailong = getThemeFromEnv() === "nailong";
  useTieSound();

  return (
    <div
      className="theme-overlay-strong cursor-pointer"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>
        {isNailong ? (
          <NailongTieContent tie={tie} />
        ) : (
          <DefaultTieContent tie={tie} />
        )}
      </div>
    </div>
  );
}
