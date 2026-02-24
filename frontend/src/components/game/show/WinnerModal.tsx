"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface WinnerModalProps {
  winner: string;
  onClose: () => void;
}

export default function WinnerModal({ winner, onClose }: WinnerModalProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/tujidan.mp3");
    audio.volume = 1;
    audio.play().catch(() => {});
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer"
      onClick={onClose}
    >
      <motion.div
        className="text-center cursor-pointer space-y-16"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-8 p-4"
          animate={{
            textShadow: [
              "0 0 20px #fbbf24",
              "0 0 40px #f59e0b",
              "0 0 20px #fbbf24",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          🏆 {winner} 🏆
        </motion.div>
        <motion.div
          className="text-6xl text-yellow-300 font-semibold mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          恭喜获得第一名！
        </motion.div>
        <motion.div
          className="mt-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  );
}
