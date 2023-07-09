export type Theme = Partial<
  { space: string } & Record<
    | 'breakpoints'
    | 'borders'
    | 'borderStyles'
    | 'borderWidths'
    | 'colors'
    | 'fonts'
    | 'fontSizes'
    | 'fontWeights'
    | 'letterSpacings'
    | 'lineHeights'
    | 'opacities'
    | 'radii'
    | 'shadows'
    | 'sizes'
    | 'transitions'
    | 'zIndices',
    Record<string, string>
  >
>;
