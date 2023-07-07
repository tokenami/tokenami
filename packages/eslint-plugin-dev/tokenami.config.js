/** @type {import('@tokenami/dev').Config} */
module.exports = {
  include: ['./app/**/*.{ts,tsx}'],
  theme: {
    space: '0.23rem',
    breakpoints: {
      md: '(min-width: 700px)',
      lg: '(min-width: 1024px)',
    },
    colors: {
      red: 'red',
    },
    radii: {
      rounded: '10px',
      circle: '9999px',
    },
  },
};
