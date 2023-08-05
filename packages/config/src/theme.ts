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

type ThemeKey = keyof typeof THEME_CONFIG;
type ThemeValues = Record<string, string> | undefined;

type GridValue = { grid: string };
type BreakpointsValues = Record<'breakpoints', ThemeValues>;

export interface Theme
  extends Partial<GridValue & BreakpointsValues & Record<ThemeKey, ThemeValues>> {}

/* -------------------------------------------------------------------------------------------------
 * getTokenValues
 * -----------------------------------------------------------------------------------------------*/

function getTokenValues(theme: Theme): Record<string, string> {
  const entries = Object.entries(theme).flatMap(([key, value]) => {
    const values = value as string | ThemeValues;
    const prefix = (THEME_CONFIG as any)[key]?.prefix;
    if (typeof values === 'string') return [[`---${key}`, value]];
    else if (!values || !prefix) return [];
    return Object.entries(values).map(([name, value]) => [`---${prefix}-${name}`, value]);
  });
  return Object.fromEntries(entries);
}

/* ---------------------------------------------------------------------------------------------- */

export { getTokenValues };
