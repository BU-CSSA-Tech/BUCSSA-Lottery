"use client";

import { useState } from "react";
import WinnerModal from "@/components/game/show/WinnerModal";
import BackgroundImage from "@/components/ui/BackgroundImage";
import { Button } from "@/components/ui/button";

export default function WinnerModalPreviewPage() {
  const [winnerName, setWinnerName] = useState("测试玩家");
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="min-h-screen relative">
      <BackgroundImage
        imageVariable="--theme-bg-image-show"
        overlayOpacity={0.03}
        centerMask={false}
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center gap-6 p-6">
        <h1 className="text-4xl font-bold theme-title">WinnerModal 预览页</h1>
        <p className="text-lg text-white/90">这里可以反复预览整套揭晓动画。</p>

        <div className="theme-panel-strong p-6 w-full max-w-xl space-y-4">
          <label className="block text-gray-800 font-semibold">中奖名字</label>
          <input
            type="text"
            value={winnerName}
            onChange={(e) => setWinnerName(e.target.value)}
            className="theme-input-glass"
            placeholder="输入展示名字"
          />
          <div className="flex gap-3">
            <Button onClick={() => setShowModal(true)} className="w-full">
              重新播放 WinnerModal
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              className="w-full"
            >
              关闭弹窗
            </Button>
          </div>
        </div>
      </div>

      {showModal && (
        <WinnerModal
          winner={winnerName || "测试玩家"}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
