export const THEMES = {
  spring: "spring",
  mario: "mario",
  "mid-autumn": "mid-autumn",
} as const;

export type ThemeName = (typeof THEMES)[keyof typeof THEMES];

export type ThemeAsset = string | null;

export type AuthMode = "login-code" | "oauth";

export type ThemePack = {
  eventName: string;
  authMode: AuthMode;
  optionA: ThemeAsset;
  optionB: ThemeAsset;
  waitGif: ThemeAsset;
  winBg: ThemeAsset;
  waitingDecor: ThemeAsset;
  revealImage: ThemeAsset;
  bgm: ThemeAsset;
  questionBgm: ThemeAsset;
  gong: ThemeAsset;
  winner: ThemeAsset;
  tie: ThemeAsset;
};

const THEME_ALIASES: Record<string, ThemeName> = {
  spring: THEMES.spring,
  mario: THEMES.mario,
  "mid-autumn": THEMES["mid-autumn"],
  midAutumn: THEMES["mid-autumn"],
  mid_autumn: THEMES["mid-autumn"],
};

const SHARED_SHOW_AUDIO = {
  bgm: "/spring/bgm.mp3",
  questionBgm: "/spring/doudizhu1.mp3",
  gong: "/spring/gong.mp3",
  tie: "/spring/zhandou.mp3",
} as const;

const THEME_PACKS: Record<ThemeName, ThemePack> = {
  spring: {
    eventName: "新春嘉年华",
    authMode: "oauth",
    optionA: "/spring/aoption.png",
    optionB: "/spring/boption.png",
    waitGif: "/spring/waitma.gif",
    winBg: "/spring/winbg.png",
    waitingDecor: "/spring/dog_small.png",
    revealImage: null,
    bgm: SHARED_SHOW_AUDIO.bgm,
    questionBgm: SHARED_SHOW_AUDIO.questionBgm,
    gong: SHARED_SHOW_AUDIO.gong,
    winner: null,
    tie: SHARED_SHOW_AUDIO.tie,
  },
  mario: {
    eventName: "新生见面会",
    authMode: "login-code",
    optionA: "/mario/optionA-pixel.png",
    optionB: "/mario/optionB-pixel.png",
    waitGif: "/mario/waitstar.gif",
    winBg: "/mario/winbg-tube.png",
    waitingDecor: "/spring/dog_small.png",
    revealImage: "/mario/question-mark.webp",
    bgm: SHARED_SHOW_AUDIO.bgm,
    questionBgm: SHARED_SHOW_AUDIO.questionBgm,
    gong: SHARED_SHOW_AUDIO.gong,
    winner: "/mario/mario-stage-clear.mp3",
    tie: SHARED_SHOW_AUDIO.tie,
  },
  "mid-autumn": {
    eventName: "中秋晚会",
    authMode: "oauth",
    optionA: null,
    optionB: null,
    waitGif: null,
    winBg: null,
    waitingDecor: null,
    revealImage: null,
    bgm: null,
    questionBgm: null,
    gong: null,
    winner: null,
    tie: null,
  },
};

export function getThemeFromEnv(value = process.env.NEXT_PUBLIC_THEME): ThemeName {
  const key = value?.trim() ?? "";
  return THEME_ALIASES[key] ?? THEMES.spring;
}

export function getThemePack(theme = getThemeFromEnv()): ThemePack {
  return THEME_PACKS[theme];
}

export function getLotteryTitle(theme = getThemeFromEnv()): string {
  return `BUCSSA ${getThemePack(theme).eventName} 抽奖`;
}

export function usesLoginCodeAuth(theme = getThemeFromEnv()): boolean {
  return getThemePack(theme).authMode === "login-code";
}

export function createThemeAudio(
  src: ThemeAsset,
  opts?: { loop?: boolean; volume?: number },
): HTMLAudioElement | null {
  if (!src) return null;
  const audio = new Audio(src);
  if (opts?.loop) audio.loop = true;
  if (opts?.volume != null) audio.volume = opts.volume;
  return audio;
}
