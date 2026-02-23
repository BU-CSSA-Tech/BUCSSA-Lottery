"use client";

import Image from "next/image";

interface QRCodeModalProps {
  onClose: () => void;
}

export default function QRCodeModal({ onClose }: QRCodeModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-lg mx-4 border border-white/20">
        <div className="text-center space-y-4">
          <div className="w-96 h-96 bg-white rounded-lg flex items-center justify-center mx-auto">
            <div className="text-white text-center p-4">
              <Image src="/qrcode.png" alt="qrcode" width={400} height={400} />
            </div>
          </div>
          <p className="text-white text-center text-2xl font-bold">lottery.bucssa.org</p>
          <button
            onClick={onClose}
            className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-all duration-200 border border-red-500/30 hover:border-red-500/50"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
