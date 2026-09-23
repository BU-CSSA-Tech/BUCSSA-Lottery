"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { createThemeAudio, getThemeFromEnv, getThemePack } from "@/lib/theme";

interface WinnerModalProps {
  winner: string;
  onClose: () => void;
  onRevealStart?: () => void;
}

const winnerStrokeStyle = {
  WebkitTextStroke: "4px #000",
  paintOrder: "stroke fill" as const,
};

function NailongWinnerReveal({ winner }: { winner: string }) {
  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.8, ease: "easeOut" }}
    >
      <motion.div
        className="text-8xl font-bold text-white p-4 origin-center"
        style={winnerStrokeStyle}
        initial={{ scale: 0, opacity: 0, filter: "blur(10px)" }}
        animate={{
          scale: 1,
          opacity: 1,
          filter: "blur(0px)",
          textShadow: [
            "0 0 20px #fbbf24",
            "0 0 40px #f59e0b",
            "0 0 20px #fbbf24",
          ],
        }}
        transition={{
          scale: { duration: 3.4, ease: [0.16, 1, 0.3, 1] },
          opacity: { duration: 3.4, ease: "easeOut" },
          filter: { duration: 3.4, ease: "easeOut" },
          textShadow: { duration: 2.4, repeat: Infinity, repeatType: "reverse" },
        }}
      >
        <span className="inline-flex items-center gap-4">
          <img
            src="/trophy.png"
            alt="trophy"
            className="w-20 h-20 md:w-24 md:h-24 object-contain"
          />
          <span>{winner}</span>
          <img
            src="/trophy.png"
            alt="trophy"
            className="w-20 h-20 md:w-24 md:h-24 object-contain"
          />
        </span>
      </motion.div>
      <motion.div
        className="text-6xl text-white font-semibold origin-center"
        style={winnerStrokeStyle}
        initial={{ scale: 0, opacity: 0, filter: "blur(8px)" }}
        animate={{
          scale: 1,
          opacity: 1,
          filter: "blur(0px)",
          textShadow: [
            "0 0 10px rgba(254,240,138,0.45)",
            "0 0 24px rgba(251,191,36,0.8)",
            "0 0 10px rgba(254,240,138,0.45)",
          ],
        }}
        transition={{
          delay: 0.6,
          scale: { duration: 3, ease: [0.16, 1, 0.3, 1] },
          opacity: { duration: 3, ease: "easeOut" },
          filter: { duration: 3, ease: "easeOut" },
          textShadow: { duration: 2.6, repeat: Infinity, repeatType: "reverse" },
        }}
      >
        恭喜获得第一名！
      </motion.div>
    </motion.div>
  );
}

function DefaultWinnerReveal({ winner }: { winner: string }) {
  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.8, ease: "easeOut" }}
    >
      <motion.div
        className="text-8xl font-bold text-white p-4"
        style={winnerStrokeStyle}
        initial={{ opacity: 0, y: 12, filter: "blur(10px)" }}
        animate={{
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          textShadow: [
            "0 0 20px #fbbf24",
            "0 0 40px #f59e0b",
            "0 0 20px #fbbf24",
          ],
        }}
        transition={{
          opacity: { duration: 2.4, ease: "easeOut" },
          y: { duration: 2.4, ease: "easeOut" },
          filter: { duration: 2.4, ease: "easeOut" },
          textShadow: { duration: 2.4, repeat: Infinity, repeatType: "reverse" },
        }}
      >
        <span className="inline-flex items-center gap-4">
          <img
            src="/trophy.png"
            alt="trophy"
            className="w-20 h-20 md:w-24 md:h-24 object-contain"
          />
          <span>{winner}</span>
          <img
            src="/trophy.png"
            alt="trophy"
            className="w-20 h-20 md:w-24 md:h-24 object-contain"
          />
        </span>
      </motion.div>
      <motion.div
        className="text-6xl text-white font-semibold"
        style={winnerStrokeStyle}
        initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
        animate={{
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          textShadow: [
            "0 0 10px rgba(254,240,138,0.45)",
            "0 0 24px rgba(251,191,36,0.8)",
            "0 0 10px rgba(254,240,138,0.45)",
          ],
        }}
        transition={{
          delay: 0.8,
          opacity: { duration: 2.2, ease: "easeOut" },
          y: { duration: 2.2, ease: "easeOut" },
          filter: { duration: 2.2, ease: "easeOut" },
          textShadow: { duration: 2.6, repeat: Infinity, repeatType: "reverse" },
        }}
      >
        恭喜获得第一名！
      </motion.div>
    </motion.div>
  );
}

export default function WinnerModal({ winner, onClose, onRevealStart }: WinnerModalProps) {
  const pack = getThemePack();
  const isNailong = getThemeFromEnv() === "nailong";
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showQuestionMark, setShowQuestionMark] = useState(() => Boolean(pack.revealImage));
  const revealTriggeredRef = useRef(false);

  useEffect(() => {
    const audio = createThemeAudio(pack.winner, { volume: 1 });
    audio?.play().catch(() => {});
    audioRef.current = audio;

    return () => {
      audio?.pause();
      audioRef.current = null;
    };
  }, [pack.winner]);

  useEffect(() => {
    if (showQuestionMark || revealTriggeredRef.current) return;
    revealTriggeredRef.current = true;
    onRevealStart?.();
  }, [showQuestionMark, onRevealStart]);

  return (
    <div
      className="theme-overlay-strong cursor-pointer"
      onClick={onClose}
    >
      <div
        className="text-center cursor-pointer space-y-12"
        onClick={(e) => e.stopPropagation()}
      >
        {showQuestionMark && pack.revealImage ? (
          <motion.img
            src={pack.revealImage}
            alt="揭晓中"
            className="w-56 h-56 md:w-72 md:h-72 object-contain mx-auto drop-shadow-[0_0_35px_rgba(255,255,255,0.35)]"
            initial={{ y: 0 }}
            animate={{
              y: [0, -30, 0, -30, 0, -30, 0],
            }}
            transition={{
              duration: 4.4,
              times: [0, 0.16, 0.33, 0.5, 0.66, 0.83, 1],
              ease: "easeInOut",
            }}
            onAnimationComplete={() => setShowQuestionMark(false)}
          />
        ) : isNailong ? (
          <NailongWinnerReveal winner={winner} />
        ) : (
          <DefaultWinnerReveal winner={winner} />
        )}
      </div>
    </div>
  );
}
