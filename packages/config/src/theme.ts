export const THEME_CONFIG = {
  borders: { prefix: 'border' },
  borderStyles: { prefix: 'border' },
  borderWidths: { prefix: 'border' },
  colors: { prefix: 'color' },
  fonts: { prefix: 'font' },
  fontSizes: { prefix: 'font' },
  fontWeights: { prefix: 'font' },
  letterSpacings: { prefix: 'tracking' },
  lineHeights: { prefix: 'leading' },
  opacities: { prefix: 'opacity' },
  radii: { prefix: 'radii' },
  shadows: { prefix: 'shadow' },
  sizes: { prefix: 'size' },
  transitions: { prefix: 'transition' },
  zIndices: { prefix: 'z' },
} as const satisfies Partial<Record<string, { prefix: string }>>;

type ThemeValues = Record<string, string> | undefined;

export interface Theme
  extends Partial<
    { grid: string } & Record<'breakpoints', ThemeValues> &
      Record<keyof typeof THEME_CONFIG, ThemeValues>
  > {}
