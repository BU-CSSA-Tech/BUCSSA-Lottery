"use client";

import { motion } from "framer-motion";

interface TieModalProps {
  tie: string[];
  onClose: () => void;
}

export default function TieModal({ tie, onClose }: TieModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        className="w-full h-full flex items-center justify-between px-8 cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 左侧选手 */}
        <motion.div
          className="flex-2/5 max-w-lg items-center justify-center space-y-4"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <motion.div
            className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-red-600 break-words px-8"
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
            style={{
              wordBreak: "break-all",
              hyphens: "auto",
              maxWidth: "100%",
              overflow: "hidden",
            }}
          >
            {tie[0] && tie[0].length > 25
              ? (() => {
                  const email = tie[0];
                  const atIndex = email.indexOf("@");
                  if (atIndex > 0) {
                    const username = email.substring(0, atIndex);
                    const domain = email.substring(atIndex);
                    return (
                      <>
                        {username.length > 15
                          ? `${username.substring(0, 15)}...`
                          : username}
                        <br />
                        {domain}
                      </>
                    );
                  }
                  return email.length > 25
                    ? `${email.substring(0, 25)}...`
                    : email;
                })()
              : tie[0]}
          </motion.div>
          <div className="text-4xl text-red-300 font-semibold text-center">
            选手 1
          </div>
        </motion.div>

        {/* 中间 VS */}
        <motion.div
          className="flex-1/5 mx-2 items-center justify-center"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
        >
          <div className="text-9xl font-bold text-center">⚔️</div>
        </motion.div>

        {/* 右侧选手 */}
        <motion.div
          className="flex-2/5 max-w-lg items-center justify-center space-y-4"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <motion.div
            className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-500 to-green-600 break-words px-8"
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
            style={{
              wordBreak: "break-all",
              hyphens: "auto",
              maxWidth: "100%",
              overflow: "hidden",
            }}
          >
            {tie[1] && tie[1].length > 25
              ? (() => {
                  const email = tie[1];
                  const atIndex = email.indexOf("@");
                  if (atIndex > 0) {
                    const username = email.substring(0, atIndex);
                    const domain = email.substring(atIndex);
                    return (
                      <>
                        {username.length > 15
                          ? `${username.substring(0, 15)}...`
                          : username}
                        <br />
                        {domain}
                      </>
                    );
                  }
                  return email.length > 25
                    ? `${email.substring(0, 25)}...`
                    : email;
                })()
              : tie[1]}
          </motion.div>
          <div className="text-4xl text-green-300 font-semibold text-center">
            选手 2
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="mt-8 text-lg text-gray-300 fixed bottom-12 left-1/2 -translate-x-1/2 text-center p-4 border border-white/50 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        点击此处关闭
      </motion.div>
    </div>
  );
}
