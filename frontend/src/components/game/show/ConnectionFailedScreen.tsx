"use client";

import { motion } from "framer-motion";
import { WifiOff } from "lucide-react";
import BackgroundImage from "@/components/ui/BackgroundImage";

export default function ConnectionFailedScreen() {
  return (
    <>
      <BackgroundImage
        imageUrl="bgup.webp"
        overlayOpacity={0.05}
        centerMask={true}
        maskWidth={90}
      />
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="border border-white/50 rounded-md bg-white/25 backdrop-blur-sm p-16 text-center max-w-2xl mx-auto space-y-8"
        >
          <motion.div
            animate={{ rotate: [0, -12, 12, -12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2.5 }}
            className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto"
          >
            <WifiOff className="w-12 h-12 text-red-500" />
          </motion.div>
          <h2 className="text-5xl font-semibold text-gray-800 tracking-wider">
            出了点小问题 🔧
          </h2>
          <p className="text-2xl text-gray-800">
            我们的服务器好生病了...
          </p>
          <p className="text-xl text-gray-800">
            游戏暂时无法连接，工作人员正在全力抢救中，请稍候片刻！
          </p>
          <div className="flex items-center justify-center gap-3 pt-4">
            <div
              className="w-3 h-3 bg-gray-800/70 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-3 h-3 bg-gray-800/70 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-3 h-3 bg-gray-800/70 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </motion.div>
      </div>
    </>
  );
}
