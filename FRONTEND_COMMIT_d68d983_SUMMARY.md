# 前端改动总结 — Commit `d68d983`

> **Commit:** `d68d983f61807c9d207b9a950ba2725250d196e1`  
> **Message:** `zhongqiu frontend`  
> **Date:** 2026-09-23  
> **范围:** 本文档仅总结该 commit 中的 **frontend** 改动（不含 `backend/package-lock.json`）。

---

## 一、改动概览

本次 commit 的核心目标是 **新增「奶龙（nailong）」主题**，用于中秋国庆晚会场景。实现方式与现有 `spring` / `mario` / `mid-autumn` 主题并列，通过环境变量 `NEXT_PUBLIC_THEME=nailong` 切换。

| 类别 | 文件数 | 说明 |
|------|--------|------|
| 新增静态资源 | 6 | `frontend/public/nailong/` |
| 主题配置 | 1 | `theme.ts` |
| 全局样式 | 1 | `globals.css`（纯 nailong 新增） |
| Show 页（大屏） | 4 | `page.tsx`, `GameContent`, `TieModal`, `WinnerModal` |
| Play 页（玩家） | 2 | `GameStatusCard`, `PlayHeader` |
| 配置示例 | 1 | `.env.example` |
| 锁文件 | 1 | `package-lock.json`（依赖锁定，无业务逻辑） |

---

## 二、分类图例

| 标签 | 含义 |
|------|------|
| 🐉 **Nailong** | 仅奶龙主题生效的样式/逻辑 |
| 🌐 **General** | 所有主题都会受影响 |
| 🔧 **Refactor** | 结构重组，行为基本不变 |
| ⚙️ **Config** | 配置/资源/文档类改动 |

---

## 三、新增静态资源

路径：`frontend/public/nailong/`

| 文件 | 用途 | 代码中是否引用 |
|------|------|----------------|
| `zhongguofeng.ttf` | 中文字体「Zhong Guo Feng」 | ✅ `globals.css` `@font-face` |
| `playbgup.webp` | Play / Main 页背景 | ✅ `globals.css` `--theme-bg-image-main/play` |
| `screen_bg.png` | Show 页背景 | ✅ `globals.css` `--theme-bg-image-show` |
| `nailongbgm.mp3` | 背景音乐 & 答题 BGM | ✅ `theme.ts` `bgm`, `questionBgm` |
| `naiwadaxiao.mp3` | Winner / Tie 音效 | ✅ `theme.ts` `winner`, `tie` |
| `naiyuezhayan.mp4` | （未在代码中引用） | ❌ 已上传，待接入 |

---

## 四、按文件说明

### 4.1 `frontend/src/lib/theme.ts` — ⚙️ Config + 🐉 Nailong

**Nailong 新增：**
- 注册主题名 `nailong` 及 alias
- 新增 `THEME_PACKS.nailong` 配置包：
  - `eventName`: 「中秋国庆晚会」
  - `authMode`: `oauth`
  - 无选项图、无 waitGif、无 winBg 等图片资源
  - 音频：`nailongbgm.mp3`（BGM）、`naiwadaxiao.mp3`（winner + tie）
  - `gong` 仍共用 spring 的 `/spring/gong.mp3`

**General 小改：**
- `mid-autumn` 的 `eventName` 从「中秋晚会」改为「中秋国庆晚会」

---

### 4.2 `frontend/src/app/globals.css` — 🐉 Nailong（纯新增，+209 行）

**全部改动均在 `[data-theme="nailong"]` 下，不影响其他主题。**

| 内容 | 说明 |
|------|------|
| `@font-face "Zhong Guo Feng"` | 全局注册字体（仅 nailong 主题变量引用） |
| `[data-theme="nailong"]` 变量块 | 字体、背景图、play 背景色 |
| `.theme-option-btn` | Play 页 A/B 文字按钮样式 |
| `.theme-show-option` / `-letter` | Show 页选项卡片 |
| `.theme-show-countdown` / `-urgent` | Show 页倒计时圆环 |
| `.theme-play-tie-title` / `-subtitle` | Play 页平局文案 |
| `.theme-nailong-tie-glow` / `-glow-sm` | TieModal 发光 VS 文字 |
| Tailwind `text-*` 升一档 | 中文字体偏小，nailong 下全局字号 +1 级 |

---

### 4.3 `frontend/src/app/show/page.tsx` — 🐉 + 🌐

| 改动 | 类型 | 说明 |
|------|------|------|
| `getThemeFromEnv()` + `isNailongTheme` | 🐉 | 首次在 page 层直接判断主题名 |
| 删除 `showWinnerConfetti` state | 🌐 **行为变化** | Spring/Mario 不再有 Confetti |
| 删除 `onRevealStart` 回调 | 🌐 | 彩带不再绑定 WinnerModal 揭晓时机 |
| Confetti 条件改为 `winner && isNailongTheme` | 🐉 | 奶龙：有 winner 即放烟花 |
| `hideTiePanel={showTieModal}` 传给 GameContent | 🌐 | TieModal 打开时隐藏背景 tie 面板 |

---

### 4.4 `frontend/src/components/game/show/GameContent.tsx` — 🐉 + 🌐

| 改动 | 类型 | 说明 |
|------|------|------|
| `hideTiePanel` prop | 🌐 | 避免全屏 TieModal 与背景 tie 面板重叠 |
| A/B 选项卡片样式 | 🐉 | nailong 用半透明 + 金色字母；其他保持绿/红框 |
| 大倒计时圆环 | 🐉 | nailong 用金色主题色；其他保持 amber/red |
| Winner 结束面板文字 | 🐉 | nailong 黑字 + `theme-title`；其他白字描边 |
| Tie 结束面板 | 🐉 为主 | nailong 用 `theme-title`、选手名 `text-2xl` |
| Tie 标题 `font-bold` + `whitespace-nowrap` | 🌐 小改 | 非 nailong 的 tie 标题也略调 |

**未改动：** 统计栏、等待态、少数派柱状图浮层。

---

### 4.5 `frontend/src/components/game/show/TieModal.tsx` — 🔧 Refactor + 🐉

| 改动 | 类型 | 说明 |
|------|------|------|
| 抽出 `useTieSound()` | 🔧 | 音频逻辑独立；`playCountRef` → `let playCount`（闭包内计数，行为不变） |
| 抽出 `DefaultTieContent` | 🔧 | 原 UI（剑图标 + 红绿渐变名）原样搬出 |
| 新增 `NailongTieContent` | 🐉 | 发光 VS + `theme-title` 选手名 |
| `isNailong` 分支 | 🐉 | 按主题渲染不同 Content |

**音频文件选择（不在 TieModal 内硬编码，由 `theme.ts` 决定）：**

| 主题 | tie 音效 |
|------|----------|
| spring / mario | `/spring/zhandou.mp3` |
| mid-autumn | 无 |
| nailong | `/nailong/naiwadaxiao.mp3` |

播放逻辑：Modal 打开后连播 **3 次**（所有有音效的主题相同）。

---

### 4.6 `frontend/src/components/game/show/WinnerModal.tsx` — 🔧 Refactor + 🐉

| 改动 | 类型 | 说明 |
|------|------|------|
| 抽出 `winnerStrokeStyle` 常量 | 🔧 | 描边样式复用 |
| 抽出 `DefaultWinnerReveal` | 🔧 | 原揭晓 UI（trophy + 滑入动画）原样搬出 |
| 新增 `NailongWinnerReveal` | 🐉 | scale 从中心放大，动画更慢（~3.4s） |
| Mario 问号揭晓 | 未改 | 仍走 `pack.revealImage` 路径 |
| `onRevealStart` prop | 保留但未使用 | `page.tsx` 已移除 callback |

**Winner 音效（`theme.ts`）：**

| 主题 | winner 音效 |
|------|-------------|
| spring / mid-autumn | 无 |
| mario | `/mario/mario-stage-clear.mp3` |
| nailong | `/nailong/naiwadaxiao.mp3` |

---

### 4.7 `frontend/src/components/game/play/GameStatusCard.tsx` — 🐉 + 🌐

| 改动 | 类型 | 说明 |
|------|------|------|
| 主容器布局 `left-4 right-4` | 🌐 | 由居中全宽改为左右留白（所有主题） |
| 平局文案 `theme-play-tie-*` | 🐉 | nailong 白字黑描边；其他保持 `text-white` |
| A/B 按钮 `theme-option-btn` | 🐉 为主 | 仅 nailong 在 CSS 中有完整样式；无图主题（mid-autumn/nailong）可能失去原 `theme-toolbar-chip` 背景 |

---

### 4.8 `frontend/src/components/game/play/PlayHeader.tsx` — 🌐 General

| 改动 | 说明 |
|------|------|
| `inline-flex w-fit` | 网络状态 chip 宽度随内容收缩 |
| `truncate` 替代 `whitespace-nowrap` | 长用户名截断而非撑破布局 |

与 nailong 无直接关系，Play 页 header 通用 UX 修复。

---

### 4.9 `frontend/.env.example` — ⚙️ Config

注释中 `NEXT_PUBLIC_THEME` 可选值增加 `nailong`：

```
# spring | mario | mid-autumn | nailong
```

---

## 五、架构模式总结

### 主题切换机制（未变）

```
NEXT_PUBLIC_THEME  →  getThemeFromEnv()  →  getThemePack()  →  资源/标题/鉴权
                              ↓
                    部分组件直接 getThemeFromEnv() === "nailong"
                    做 UI 分支（page / GameContent / TieModal / WinnerModal / GameStatusCard）
```

### 样式分层

1. **`globals.css`** — nailong 主题 token + 组件 class override（`[data-theme="nailong"]` 前缀）
2. **`theme.ts`** — 音频、图片路径、活动名等业务配置
3. **组件内 `isNailong ? ... : ...`** — 结构/动画差异较大的 UI 分支

---

## 六、General 行为变化清单（Review 时注意）

以下改动 **会影响非 nailong 主题**，提交前/合并前建议确认是否符合预期：

| # | 位置 | 变化 |
|---|------|------|
| 1 | `show/page.tsx` | Spring/Mario **不再有** Winner Confetti（原在 Modal 揭晓后触发） |
| 2 | `show/page.tsx` | 新增 `hideTiePanel`，TieModal 打开时隐藏背景面板（改善所有主题） |
| 3 | `GameStatusCard.tsx` | 状态卡片布局改为 `left-4 right-4`（所有主题） |
| 4 | `GameStatusCard.tsx` | 无图 A/B 按钮 class 从 `theme-toolbar-chip` 改为 `theme-option-btn`（mid-autumn 等可能样式变弱） |
| 5 | `GameContent.tsx` | 非 nailong tie 标题 `font-normal` → `font-bold` |
| 6 | `PlayHeader.tsx` | 用户名 chip 布局/截断优化 |
| 7 | `theme.ts` | mid-autumn 活动名改为「中秋国庆晚会」 |

---

## 七、Nailong 主题完整能力一览

启用方式：`NEXT_PUBLIC_THEME=nailong`

| 能力 | 实现位置 |
|------|----------|
| 中文字体 + 字号放大 | `globals.css` |
| Play/Show 背景图 | `globals.css` + `theme.ts` |
| Show 页选项/倒计时样式 | `globals.css` + `GameContent.tsx` |
| Show 页 Winner Confetti | `show/page.tsx` |
| Show 页 Tie/Winner 全屏 Modal | `TieModal.tsx` / `WinnerModal.tsx` |
| Play 页平局/选项按钮 | `GameStatusCard.tsx` + `globals.css` |
| BGM / Winner / Tie 音效 | `theme.ts` → `nailongbgm.mp3`, `naiwadaxiao.mp3` |

---

## 八、待办 / 已知遗留

- [ ] `naiyuezhayan.mp4` 已放入 `public/nailong/`，代码中尚未引用
- [ ] `WinnerModal` 的 `onRevealStart` prop 仍保留，但 `page.tsx` 已不再传入（可考虑后续清理）
- [ ] 非 nailong 主题 Confetti 被移除，若 Spring/Mario 仍需彩带需单独恢复

---

*文档生成于 code review 记录，对应 commit `d68d983`。*
