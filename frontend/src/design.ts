// Apple iOS-style design tokens — light & dark

export const useColors = () => {
  // Read data-theme from DOM (set by ThemeProvider)
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  return dark ? darkColors : lightColors;
};

export const lightColors = {
  bg: '#f2f2f7',
  bg2: '#e5e5ea',
  surface: '#ffffff',
  surface2: '#f2f2f7',
  surface3: 'rgba(255,255,255,0.85)',
  fg: '#1c1c1e',
  fg2: '#3c3c43',
  fg3: '#8e8e93',
  accent: '#007aff',
  accentMuted: 'rgba(0,122,255,0.10)',
  success: '#34c759',
  successMuted: 'rgba(52,199,89,0.10)',
  warning: '#ff9500',
  warningMuted: 'rgba(255,149,0,0.10)',
  danger: '#ff3b30',
  dangerMuted: 'rgba(255,59,48,0.08)',
  separator: 'rgba(60,60,67,0.12)',
  border: 'rgba(60,60,67,0.16)',
  cardShadow: '0 1px 3px rgba(0,0,0,0.07), 0 6px 20px rgba(0,0,0,0.04)',
  navBg: 'rgba(242,242,247,0.92)',
  headerBg: 'rgba(242,242,247,0.88)',
};

export const darkColors = {
  bg: '#000000',
  bg2: '#1c1c1e',
  surface: '#1c1c1e',
  surface2: '#2c2c2e',
  surface3: 'rgba(28,28,30,0.92)',
  fg: '#ffffff',
  fg2: '#ebebf5',
  fg3: '#8e8e93',
  accent: '#0a84ff',
  accentMuted: 'rgba(10,132,255,0.15)',
  success: '#32d74b',
  successMuted: 'rgba(50,215,75,0.12)',
  warning: '#ff9f0a',
  warningMuted: 'rgba(255,159,10,0.12)',
  danger: '#ff453a',
  dangerMuted: 'rgba(255,69,58,0.12)',
  separator: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.10)',
  cardShadow: '0 1px 3px rgba(0,0,0,0.4), 0 6px 20px rgba(0,0,0,0.3)',
  navBg: 'rgba(18,18,18,0.94)',
  headerBg: 'rgba(18,18,18,0.9)',
};

export type Colors = typeof lightColors;

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };
export const typography = {
  largeTitle: { fontSize: 34, fontWeight: 700, letterSpacing: -0.5 } as const,
  title2: { fontSize: 22, fontWeight: 700, letterSpacing: -0.3 } as const,
  headline: { fontSize: 17, fontWeight: 600, letterSpacing: -0.1 } as const,
  body: { fontSize: 17, fontWeight: 400, letterSpacing: -0.1 } as const,
  subhead: { fontSize: 15, fontWeight: 400, letterSpacing: -0.1 } as const,
  footnote: { fontSize: 13, fontWeight: 400, letterSpacing: -0.05 } as const,
  caption1: { fontSize: 12, fontWeight: 400, lineHeight: 1.5 } as const,
  caption2: { fontSize: 11, fontWeight: 400, lineHeight: 1.5 } as const,
};
