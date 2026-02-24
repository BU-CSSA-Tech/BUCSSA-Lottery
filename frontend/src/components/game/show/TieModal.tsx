"use client";

import { motion } from "framer-motion";
import { Swords } from "lucide-react";

interface TieModalProps {
  tie: string[];
  onClose: () => void;
}

export default function TieModal({ tie, onClose }: TieModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer"
      onClick={onClose}
    >
      {/* 以中间图标为基准，选手相对图标定位 */}
      <div
        className="relative flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 中间 V.S 符号 - 视觉中心与定位基准 */}
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

        {/* 选手 1 - 图标左上角，距离适中 */}
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

        {/* 选手 2 - 图标右下角，距离适中 */}
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
    </div>
  );
}
