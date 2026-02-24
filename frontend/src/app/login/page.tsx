"use client";

import { signIn, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowRight, UserIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import BackgroundImage from "@/components/ui/BackgroundImage";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 检查登录状态并重定向
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

  return (
    <>
      <BackgroundImage
        imageUrl="playbg.png"
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="p-6 max-w-md mx-auto"
          >
            <div className="flex mb-8 items-center justify-center gap-2">
              <div className="text-center text-2xl font-bold">登 录</div>
            </div>
            <div className="text-center">
              {/* Google 登录按钮 */}
              <Button
                onClick={handleGoogleSignIn}
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
                onClick={handleAzureADSignIn}
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
          </motion.div>

          <div className="bg-white/60 rounded-lg p-3">
            <div className="text-gray-800 text-sm text-center">
              <strong>提示：</strong>如果登录后被踢出来，可能是游戏已开始或者管理员未重置，请耐心等候哦！
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
