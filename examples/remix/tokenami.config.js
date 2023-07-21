/** @type {import('@tokenami/dev').Config} */
module.exports = {
  include: ['./app/**/*.{ts,tsx}'],
  exclude: ['./app/routes/original.tsx'],
  theme: {
    space: '0.23rem',
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
    },
    fonts: {
      serif: 'serif',
      sans: 'sans-serif',
    },
  },
};
