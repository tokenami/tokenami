import { createConfig, defaultConfig } from '@tokenami/dev';

export default createConfig({
  include: ['./app/**/*.{ts,tsx}'],
  exclude: ['./app/routes/original.tsx'],
  responsive: {
    md: '@media (min-width: 700px)',
    lg: '@media (min-width: 1024px)',
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
  },
  aliases: {
    'bg-color': ['background-color'],
    m: ['mt', 'mr', 'mb', 'ml', 'mx', 'my', 'margin'],
    mx: ['ml', 'mr', 'margin-left', 'margin-right'],
    my: ['mt', 'mb', 'margin-top', 'margin-bottom'],
    mt: ['margin-top'],
    mr: ['margin-right'],
    mb: ['margin-bottom'],
    ml: ['margin-left'],
    p: ['pt', 'pr', 'pb', 'pl', 'px', 'py', 'padding'],
    px: ['pl', 'pr', 'padding-left', 'padding-right'],
    py: ['pt', 'pb', 'padding-top', 'padding-bottom'],
    pt: ['padding-top'],
    pr: ['padding-right'],
    pb: ['padding-bottom'],
    pl: ['padding-left'],
  },
  properties: {
    ...defaultConfig.properties,
    content: ['pet'],
  },
});
