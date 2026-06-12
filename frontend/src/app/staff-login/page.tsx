"use client";

import { signIn, useSession } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import BackgroundImage from "@/components/ui/BackgroundImage";

const inputClassName = "theme-input-glass";

export default function StaffLoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleStaffLogin = async () => {
    setError("");

    if (!staffEmail.trim() || !staffPassword) {
      setError("请输入邮箱和密码");
      return;
    }

    setLoading(true);

    const result = await signIn("staff-credentials", {
      email: staffEmail.trim(),
      password: staffPassword,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("邮箱或密码错误");
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const sessionData = await sessionRes.json();

    if (sessionData?.user?.isAdmin) {
      router.push("/admin");
    } else if (sessionData?.user?.isDisplay) {
      router.push("/show");
    } else {
      setError("邮箱或密码错误");
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
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white"
              >
                <ArrowRight className="w-4 h-4 rotate-180 mr-2" />
                返回玩家登录
              </Button>
            </Link>
          </div>

          <div className="p-6 max-w-md mx-auto w-full">
            <div className="flex mb-6 items-center justify-center">
              <div className="text-center text-2xl font-bold text-white">管理员登录</div>
            </div>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (loading || !staffEmail.trim() || !staffPassword) return;
                void handleStaffLogin();
              }}
            >
              <input
                type="email"
                placeholder="邮箱"
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                className={inputClassName}
                disabled={loading}
                autoComplete="email"
              />
              <input
                type="password"
                placeholder="密码"
                value={staffPassword}
                onChange={(e) => setStaffPassword(e.target.value)}
                className={inputClassName}
                disabled={loading}
                autoComplete="current-password"
              />
              <Button
                type="submit"
                size="lg"
                variant="secondary"
                className="w-full"
                disabled={loading || !staffEmail.trim() || !staffPassword}
              >
                {loading ? "登录中..." : "管理员登录"}
              </Button>
            </form>

            {error && (
              <p className="mt-4 text-center text-sm text-red-300">{error}</p>
            )}
          </div>

          <div className="theme-hint-card">
            <div className="text-gray-800 text-sm text-center">
              <strong>提示：</strong>此入口仅供工作人员使用
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
