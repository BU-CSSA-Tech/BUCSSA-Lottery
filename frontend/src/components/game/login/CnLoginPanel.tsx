"use client";

import { Button } from "@/components/ui/button";

const inputClassName =
  "theme-input-glass";

interface CnLoginPanelProps {
  code: string;
  onCodeChange: (value: string) => void;
  loading: boolean;
  error: string;
  welcomeName: string | null;
  onPlayerLogin: () => void;
}

export default function CnLoginPanel({
  code,
  onCodeChange,
  loading,
  error,
  welcomeName,
  onPlayerLogin,
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
          className={`${inputClassName} text-center text-2xl tracking-[0.5em] theme-font-body`}
          disabled={loading}
        />
        <Button type="submit" size="lg" className="w-full" disabled={loading || code.length !== 6}>
          {loading ? "验证中..." : "进入游戏"}
        </Button>
        <p className="text-center text-xs text-white/60">
          请观看现场投屏获取登录码，请勿清除浏览器缓存
        </p>
      </form>

      {error && (
        <p className="text-center text-sm text-red-300">{error}</p>
      )}
    </div>
  );
}
