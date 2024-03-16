import { createConfig, defaultConfig } from '@tokenami/css';

export default createConfig({
  include: ['./src/**/*.{ts,tsx}'],
  responsive: {
    md: '@media (min-width: 700px)',
    lg: '@media (min-width: 1024px)',
    xl: '@media (min-width: 1280px)',
    '2xl': '@media (min-width: 1536px)',
  },
  theme: {
    anim: {
      wiggle: 'wiggle 1s ease-in-out infinite',
    },
    color: {
      'slate-100': '#f1f5f9',
      'slate-700': '#334155',
      'sky-500': '#0ea5e9',
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
    pet: {
      cat: '"🐱"',
      dog: '"🐶"',
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
    'focus-hover': '&:focus:hover',
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
});
