import { type Config, createConfig, defaultConfig } from '@tokenami/css';

const keyframes = {
  'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
  'fade-out': { '0%': { opacity: 1 }, '100%': { opacity: 0 } },
  'scale-in': { '0%': { transform: 'scale(0.8)' }, '100%': { transform: 'scale(1)' } },
  'scale-out': { '0%': { transform: 'scale(1)' }, '100%': { transform: 'scale(0.8)' } },
};

const palette = {
  white: 'hsl(0 0% 100%)',
  whiteA: 'hsl(0 0% 100% / 30%)',
  teal100: 'hsl(190 65% 81%)',
  teal300: 'hsl(190 65% 70%)',
  teal500: 'hsl(190 47% 34%)',
  teal600: 'hsl(190 47% 24%)',
  purple100: 'hsl(258 100% 86%)',
  purple200: 'hsl(258 38% 50%)',
  purple300: 'hsl(258 100% 83%)',
  purple500: 'hsl(258 100% 3%)',
  purple500A: 'hsl(258 100% 3% / 10%)',
  purple600: 'hsl(258 58% 20%)',
  muave300: 'hsl(250 9% 69%)',
  muave600: 'hsl(250 9% 39%)',
};

const color = {
  light: {
    headline: palette.purple500,
    heading: palette.purple500,
    body: palette.muave600,
    primary: palette.teal300,
    'primary-bright': palette.teal100,
    secondary: palette.purple300,
    'secondary-bright': palette.purple100,
    surface: palette.white,
    'on-surface': palette.purple500,
    shadow: palette.purple500,
    'shadow-alpha': palette.purple500A,
  },
  dark: {
    headline: palette.white,
    heading: palette.white,
    body: palette.muave300,
    primary: palette.teal600,
    'primary-bright': palette.teal500,
    secondary: palette.purple600,
    'secondary-bright': palette.purple200,
    surface: palette.purple500,
    'on-surface': palette.white,
    shadow: palette.purple500,
    'shadow-alpha': palette.purple500A,
  },
};

const theme = {
  anim: {
    'fade-in': 'fade-in 200ms ease forwards',
    'fade-out': 'fade-out 200ms ease forwards',
    'scale-in': 'scale-in 300ms ease forwards',
    'scale-out': 'scale-out 300ms ease forwards',
  },
  border: {
    none: '0',
    thin: '1px solid var(--color_slate-700)',
  },
  surface: {
    'radial-gradient-t':
      'radial-gradient(circle at top, var(---surface-from), var(---surface-to) 80%)',
    'radial-gradient-tl':
      'radial-gradient(circle at top left, var(---surface-from) 0%, var(---surface-to) 50%, var(---surface-from) 100%)',
  },
  shadow: {
    border: '0 0 0 3px var(--color_shadow-alpha)',
  },
  borderRadius: {
    none: '0',
    sm: '0.375rem',
    DEFAULT: '0.625rem',
    full: '9999px',
  },
  font: {
    serif: 'serif',
    sans: 'sans-serif',
  },
  radii: {
    none: '0',
    sm: '0.375rem',
    md: '0.625rem',
    full: '9999px',
  },
  size: {
    auto: 'auto',
    fill: '100%',
    'screen-h': '100vh',
    'screen-w': '100vw',
  },
} satisfies Config['theme'];

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
      color: 'var(--color_body)',
      // @ts-ignore
      '-webkit-font-smoothing': 'antialiased',
      '-moz-osx-font-smoothing': 'grayscale',
    },
  },
  responsive: {
    xs: '@media (min-width: 320px)',
    sm: '@media (min-width: 480px)',
    md: '@media (min-width: 768px)',
    lg: '@media (min-width: 976px)',
    xl: '@media (min-width: 1440px)',
  },
  keyframes,
  theme: {
    modes: {
      light: {
        ...theme,
        color: color.light,
      },
      dark: {
        ...theme,
        color: color.dark,
      },
    },
  },
  selectors: {
    ...defaultConfig.selectors,
    hover: ['@media (hover: hover) and (pointer: fine)', '&:hover'],
    light: '.theme-light &',
    dark: '.theme-dark &',
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
    size: ['width', 'height'],
  },
  properties: {
    ...defaultConfig.properties,
    '---surface-from': ['color'],
    '---surface-to': ['color'],
  },
});
