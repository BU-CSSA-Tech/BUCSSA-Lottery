"use client";

import Image from "next/image";

interface QRCodeModalProps {
  onClose: () => void;
}

export default function QRCodeModal({ onClose }: QRCodeModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center">
      <div className="bg-amber-50/98 backdrop-blur-lg rounded-2xl p-8 max-w-lg mx-4 border border-rose-200/70 shadow-xl">
        <div className="text-center space-y-4">
          <div className="w-72 h-72 md:w-96 md:h-96 bg-white rounded-xl flex items-center justify-center mx-auto border border-rose-100">
            <Image src="/qrcode.png" alt="qrcode" width={350} height={350} className="p-2" />
          </div>
          <p className="text-gray-800 text-center text-xl font-bold">lottery.bucssa.org</p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-xl transition-all border border-red-200/60"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
