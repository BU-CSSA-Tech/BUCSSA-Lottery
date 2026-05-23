export const THEMES = {
  spring: "spring",
  mario: "mario",
} as const;

export type ThemeName = keyof typeof THEMES;

export function getThemeFromEnv(value = process.env.NEXT_PUBLIC_THEME): ThemeName {
  return value === THEMES.mario ? THEMES.mario : THEMES.spring;
}
