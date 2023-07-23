/** @type {import('@tokenami/dev').Config} */
module.exports = {
  include: ['./app/**/*.{ts,tsx}'],
  exclude: ['./app/routes/original.tsx'],
  theme: {
    grid: '4px',
    breakpoints: {
      md: '(min-width: 700px)',
      lg: '(min-width: 1024px)',
    },
    colors: {
      'slate-100': '#f1f5f9',
      'slate-700': '#334155',
      'sky-500': '#0ea5e9',
    },
    radii: {
      rounded: '10px',
      circle: '9999px',
      none: 'none',
    },
    fonts: {
      serif: 'serif',
      sans: 'sans-serif',
    },
    sizes: {
      auto: 'auto',
      'full-w': '100%',
      'full-h': '100%',
      'screen-h': '100vh',
    },
  },
};
