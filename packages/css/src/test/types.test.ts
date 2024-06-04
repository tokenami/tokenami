import { css, createConfig, defaultConfig } from '../';

/* -------------------------------------------------------------------------------------------------
 * test setup
 * -----------------------------------------------------------------------------------------------*/

const config = createConfig({
  include: ['./src/**/*.{ts,tsx}'],
  responsive: {
    md: '@media (min-width: 700px)',
    lg: '@media (min-width: 1024px)',
    xl: '@media (min-width: 1280px)',
    '2xl': '@media (min-width: 1536px)',
  },
  theme: {
    color: {
      'slate-100': '#f1f5f9',
      'slate-700': '#334155',
      'sky-500': '#0ea5e9',
    },
    anim: {
      wiggle: 'wiggle 1s ease-in-out infinite',
    },
    border: {
      thin: '1px solid var(--color_slate-700)',
    },
    font: {
      serif: 'serif',
      sans: 'sans-serif',
    },
    radii: {
      rounded: '10px',
      circle: '9999px',
      none: 'none',
    },
    size: {
      auto: 'auto',
      fill: '100%',
      'screen-h': '100vh',
    },
  },
  keyframes: {
    wiggle: {
      '0%, 100%': { transform: 'rotate(-3deg)' },
      '50%': { transform: 'rotate(3deg)' },
    },
  },
  selectors: {
    ...defaultConfig.selectors,
    hover: ['@media (hover: hover) and (pointer: fine)', '&:hover'],
  },
  aliases: {
    p: ['padding'],
    px: ['padding-left', 'padding-right'],
    py: ['padding-top', 'padding-bottom'],
    pt: ['padding-top'],
    pr: ['padding-right'],
    pb: ['padding-bottom'],
    pl: ['padding-left'],
  },
});

type Config = typeof config;

declare module '@tokenami/dev' {
  interface TokenamiConfig extends Config {}
}

/* -------------------------------------------------------------------------------------------------
 * test cases
 * -----------------------------------------------------------------------------------------------*/

export const expectInvalidPropertiesToError = css({
  // @ts-expect-error
  '--boop': 'boop',
});

export const expectInvalidValuesToError = css({
  // @ts-expect-error
  '--border-color': 'red',
});

export const expectInvalidSelectorToError = css({
  // @ts-expect-error
  '--selector_color': 'var(--color_sky-500)',
});

export const expectInvalidResponsiveSelectorsToError = css({
  // @ts-expect-error
  '--responsive_selector_color': 'var(--color_sky-500)',
});

export const expectInvalidResponsiveWithValidSelectorToError = css({
  // @ts-expect-error
  '--responsive_hover_color': 'var(--color_sky-500)',
});

export const expectValidResponsiveWithInvalidSelectorToError = css({
  // @ts-expect-error
  '--md_selector_color': 'var(--color_sky-500)',
});

export const expectValidResponsiveAndValidSelectorWithInvalidPropertyToError = css({
  // @ts-expect-error
  '--md_hover_boop': 'var(--color_sky-500)',
});

export const expectValidPropertiesToPass = css({
  '--display': 'block',
});

export const expectValidThemeValuesToPass = css({
  '--color': 'var(--color_sky-500)',
});

export const expectValidSelectorToPass = css({
  '--hover_color': 'var(--color_sky-500)',
});

export const expectValidResponsiveSelectorToPass = css({
  '--md_hover_color': 'var(--color_sky-500)',
});
