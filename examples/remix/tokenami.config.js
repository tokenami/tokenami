const palette = {
  red100: '#c00',
  blue100: 'blue',
  green100: 'green',
  white: 'white',
};

/** @type {import('@tokenami/cli').Config} */
module.exports = {
  include: ['./app/**/*.{ts,tsx}'],
  theme: {
    space: '0.23rem',
    breakpoints: {
      md: '(min-width: 500px)',
      lg: '(min-width: 800px)',
    },
    colors: {
      ...palette,
      primary: palette.red100,
      secondary: palette.blue100,
    },
    radii: {
      rounded: '10px',
      circle: '9999px',
    },
  },
};
