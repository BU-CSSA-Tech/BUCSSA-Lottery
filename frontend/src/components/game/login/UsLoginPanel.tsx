"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

interface UsLoginPanelProps {
  onGoogleSignIn: () => void;
  onAzureSignIn: () => void;
}

export default function UsLoginPanel({ onGoogleSignIn, onAzureSignIn }: UsLoginPanelProps) {
  return (
    <div className="text-center">
      <Button
        onClick={onGoogleSignIn}
        size="lg"
        className="w-full mb-6"
        variant="outline"
      >
        <Image
          src="/google.svg"
          alt="Google"
          width={20}
          height={20}
          className="mr-2"
        />
        Google 登录
      </Button>

      <Button
        onClick={onAzureSignIn}
        size="lg"
        className="w-full mb-6"
        variant="outline"
      >
        <Image
          src="/outlook.png"
          alt="Azure"
          width={20}
          height={20}
          className="mr-2"
        />
        Outlook 登录
      </Button>

      <div className="text-center text-sm text-white/80">
        登录即表示您同意我们的{" "}
        <a href="/term" className="text-red-400 underline">
          《使用与参与条款》
        </a>
      </div>
    </div>
  );
}
