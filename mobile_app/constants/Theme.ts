// GigToGeek Mobile — Design Tokens
export const Colors = {
  bgPrimary:    '#030504',
  bgSecondary:  '#0a100d',
  bgCard:       'rgba(255,255,255,0.02)',
  bgCardHover:  'rgba(44, 211, 111, 0.04)',
  border:       'rgba(44, 211, 111, 0.12)',

  accent1: '#2CD36F',   // neon green
  accent2: '#00E676',   // bright green
  accent3: '#10b981',   // teal/green
  success: '#2CD36F',
  error:   '#ef4444',
  warning: '#f59e0b',

  textPrimary:   '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted:     '#475569',

  // gradients expressed as array for LinearGradient
  gradientBlue:   ['#2CD36F', '#10b981'] as const,
  gradientCyan:   ['#00E676', '#2CD36F'] as const,
  gradientGold:   ['#f59e0b', '#ef4444'] as const,
};

export const Radii = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  full: 9999,
};

export const Spacing = {
  xs:  4,
  sm:  8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSize = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  xxl:  30,
  xxxl: 36,
};
