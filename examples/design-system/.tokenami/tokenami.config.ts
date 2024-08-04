import { createConfig, defaultConfig } from '@tokenami/css';

const createPalette = (opacity: string) => ({
  'slate-100': `rgba(241 245 249 / ${opacity})`,
  'slate-700': `rgba(51 65 85 / ${opacity})`,
  'sky-500': `rgba(14 165 233 / ${opacity})`,
});

const colorPalette = createPalette('var(--color-opacity, 1)');
const shadowPalette = createPalette('var(--shadow-opacity, 1)');

export default createConfig({
  include: ['./src/**/*.{ts,tsx}'],
  globalStyles: {
    '*, *::before, *::after': {
      boxSizing: 'border-box',
    },
    body: {
      fontFamily: 'system-ui, sans-serif',
      lineHeight: 1.5,
      margin: 0,
      padding: 0,
    },
  },
  responsive: {
    md: '@media (min-width: 700px)',
    lg: '@media (min-width: 1024px)',
    xl: '@media (min-width: 1280px)',
    '2xl': '@media (min-width: 1536px)',
  },
  theme: {
    alpha: {
      '0': '0',
      '10': '0.1',
      '20': '0.2',
      '30': '0.3',
      '40': '0.4',
      '50': '0.5',
      '60': '0.6',
      '70': '0.7',
      '80': '0.8',
      '90': '0.9',
      '100': '1',
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
    modes: {
      light: {
        color: {
          ...colorPalette,
          primary: colorPalette['slate-100'],
          secondary: colorPalette['slate-700'],
          tertiary: colorPalette['sky-500'],
        },
        shadow: {
          ...shadowPalette,
          primary: shadowPalette['slate-100'],
          secondary: shadowPalette['slate-700'],
          tertiary: shadowPalette['sky-500'],
        },
      },
      dark: {
        color: {
          ...colorPalette,
          primary: colorPalette['sky-500'],
          secondary: colorPalette['slate-100'],
          tertiary: colorPalette['slate-700'],
        },
        shadow: {
          ...shadowPalette,
          primary: shadowPalette['sky-500'],
          secondary: shadowPalette['slate-100'],
          tertiary: shadowPalette['slate-700'],
        },
      },
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
    'bg-color': ['background-color'],
    m: ['margin'],
    mx: ['margin-left', 'margin-right'],
    my: ['margin-top', 'margin-bottom'],
    mt: ['margin-top'],
    mr: ['margin-right'],
    mb: ['margin-bottom'],
    ml: ['margin-left'],
    p: ['padding'],
    px: ['padding-left', 'padding-right'],
    py: ['padding-top', 'padding-bottom'],
    pt: ['padding-top'],
    pr: ['padding-right'],
    pb: ['padding-bottom'],
    pl: ['padding-left'],
  },
  properties: {
    ...defaultConfig.properties,
    'color-opacity': ['alpha'],
    'shadow-opacity': ['alpha'],
  },
});
