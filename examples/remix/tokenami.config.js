/** @type {import('@tokenami/dev').Config} */
module.exports = {
  include: ['./app/**/*.{ts,tsx}'],
  exclude: ['./app/routes/original.tsx'],
  grid: '4px',
  media: {
    md: '(min-width: 700px)',
    lg: '(min-width: 1024px)',
  },
  keyframes: {
    wiggle: {
      '0%, 100%': { transform: 'rotate(-3deg)' },
      '50%': { transform: 'rotate(3deg)' },
    },
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
    radii: {
      rounded: '10px',
      circle: '9999px',
      none: 'none',
    },
    font: {
      serif: 'serif',
      sans: 'sans-serif',
    },
    size: {
      auto: 'auto',
      'full-w': '100%',
      'full-h': '100%',
      'screen-h': '100vh',
    },
  },
};
