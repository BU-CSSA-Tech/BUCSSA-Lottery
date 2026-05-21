"use client";

import { Button } from "@/components/ui/button";

const inputClassName =
  "w-full px-4 py-3 rounded-xl border-2 border-white/60 bg-white/90 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-white/90";

interface CnLoginPanelProps {
  code: string;
  onCodeChange: (value: string) => void;
  staffEmail: string;
  onStaffEmailChange: (value: string) => void;
  staffPassword: string;
  onStaffPasswordChange: (value: string) => void;
  loading: boolean;
  error: string;
  welcomeName: string | null;
  onPlayerLogin: () => void;
  onStaffLogin: () => void;
}

export default function CnLoginPanel({
  code,
  onCodeChange,
  staffEmail,
  onStaffEmailChange,
  staffPassword,
  onStaffPasswordChange,
  loading,
  error,
  welcomeName,
  onPlayerLogin,
  onStaffLogin,
}: CnLoginPanelProps) {
  if (welcomeName) {
    return (
      <div className="text-center text-2xl font-bold text-white py-12">
        您是 {welcomeName}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Player section — Enter in the code field submits this form */}
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (loading || code.length !== 6) return;
          onPlayerLogin();
        }}
      >
        <p className="text-center text-sm text-white/70 font-medium">玩家登录</p>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="输入 6 位登录码"
          value={code}
          onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className={`${inputClassName} text-center text-2xl tracking-[0.5em] font-mono`}
          disabled={loading}
        />
        <Button type="submit" size="lg" className="w-full" disabled={loading || code.length !== 6}>
          {loading ? "验证中..." : "进入游戏"}
        </Button>
        <p className="text-center text-xs text-white/60">
          请观看现场投屏获取登录码，请勿清除浏览器缓存
        </p>
      </form>

      <div className="border-t border-white/30" />

      {/* Staff section — Enter in email/password submits this form */}
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const emailOk = Boolean(staffEmail.trim());
          if (loading || !emailOk || !staffPassword) return;
          onStaffLogin();
        }}
      >
        <p className="text-center text-sm text-white/70 font-medium">管理 / 投屏登录</p>
        <input
          type="email"
          placeholder="邮箱"
          value={staffEmail}
          onChange={(e) => onStaffEmailChange(e.target.value)}
          className={inputClassName}
          disabled={loading}
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="密码"
          value={staffPassword}
          onChange={(e) => onStaffPasswordChange(e.target.value)}
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
          {loading ? "登录中..." : "管理 / 投屏登录"}
        </Button>
      </form>

      {error && (
        <p className="text-center text-sm text-red-300">{error}</p>
      )}
    </div>
  );
}
