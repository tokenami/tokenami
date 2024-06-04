import { css, createConfig, createCss } from '../';

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
  },
  aliases: {
    p: ['padding'],
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

/* -------------------------------------------------------------------------------------------------
 * test cases with aliases
 * -----------------------------------------------------------------------------------------------*/

const myCss = createCss(config);

export const expectInvalidAliasesToError = myCss({
  // @ts-expect-error
  '--s': 2,
});

export const expectInvalidAliasValuesToError = myCss({
  // @ts-expect-error
  '--p': '2',
});

export const expectValidAliasesToPass = myCss({
  '--p': 2,
});

export const expectValidAliasesWithResponsiveToPass = myCss({
  '--md_p': 2,
});

export const expectValidAliasesWithSelectorToPass = myCss({
  '--hover_p': 2,
});

export const expectValidAliasesWithResponsiveAndSelectorToPass = myCss({
  '--md_hover_p': 2,
});
