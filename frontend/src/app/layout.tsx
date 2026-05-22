import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'
import { getThemeFromEnv } from '@/lib/theme'

export const metadata: Metadata = {
  title: '少数派游戏系统',
  description: '基于 Next.js 的高并发少数派游戏系统，支持A/B选择少数派胜出',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const activeTheme = getThemeFromEnv();

  return (
    <html lang="zh-CN" data-theme={activeTheme}>
      <body className="font-alimama antialiased" data-theme={activeTheme}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
