import { createConfig } from '../';

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

/* ---------------------------------------------------------------------------------------------- */

export { config };
