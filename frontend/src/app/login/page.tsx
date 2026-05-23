"use client";

import { signIn, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import BackgroundImage from "@/components/ui/BackgroundImage";
import RegionToggle, { type Region } from "@/components/game/login/RegionToggle";
import UsLoginPanel from "@/components/game/login/UsLoginPanel";
import CnLoginPanel from "@/components/game/login/CnLoginPanel";
import { getOrCreatePlayerId } from "@/lib/player-id";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [region, setRegion] = useState<Region>("us");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [welcomeName, setWelcomeName] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (session.user.isAdmin) {
        router.push("/admin");
      } else if (session.user.isDisplay) {
        router.push("/show");
      } else {
        router.push("/play");
      }
    }
  }, [session, status, router]);

  const handleGoogleSignIn = async () => {
    await signIn("google");
  };

  const handleAzureADSignIn = async () => {
    await signIn("azure-ad");
  };

  const handlePlayerLogin = async () => {
    setError("");
    const trimmed = code.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setError("请输入 6 位数字登录码");
      return;
    }

    setLoading(true);
    const playerId = getOrCreatePlayerId();

    const result = await signIn("player-code", {
      code: trimmed,
      playerId,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setError("登录码无效或已过期，请查看现场投屏");
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const sessionData = await sessionRes.json();
    const displayName = sessionData?.user?.name as string | undefined;

    setLoading(false);

    if (displayName) {
      setWelcomeName(displayName);
      setTimeout(() => router.push("/play"), 1500);
    } else {
      router.push("/play");
    }
  };

  return (
    <div>
      <BackgroundImage
        overlayOpacity={0.05}
        centerMask={true}
        maskWidth={90}
      />
      <div className="min-h-screen relative z-10">
        <div className="h-screen flex flex-col justify-between p-4">
          <div className="items-start">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white"
              >
                <ArrowRight className="w-4 h-4 rotate-180 mr-2" />
                返回首页
              </Button>
            </Link>
          </div>

          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="p-6 max-w-md mx-auto w-full"
          >
            <div className="flex mb-6 items-center justify-center">
              <div className="text-center text-2xl font-bold text-white">登 录</div>
            </div>

            <RegionToggle region={region} onChange={setRegion} />

            {region === "us" ? (
              <UsLoginPanel
                onGoogleSignIn={handleGoogleSignIn}
                onAzureSignIn={handleAzureADSignIn}
              />
            ) : (
              <CnLoginPanel
                code={code}
                onCodeChange={setCode}
                loading={loading}
                error={error}
                welcomeName={welcomeName}
                onPlayerLogin={handlePlayerLogin}
              />
            )}
          </motion.div>

          <div className="theme-hint-card">
            <div className="text-gray-800 text-sm text-center">
              <strong>提示：</strong>如果登录后被踢出来，可能是游戏已开始或者管理员未重置，请耐心等候哦！
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
