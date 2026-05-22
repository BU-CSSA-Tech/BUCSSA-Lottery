export const THEMES = {
  spring: "spring",
} as const;

export type ThemeName = keyof typeof THEMES;

export function getThemeFromEnv(): ThemeName {
  return THEMES.spring;
}
