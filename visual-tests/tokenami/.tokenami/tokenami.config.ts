import designSystem from '@tokenami/example-design-system/config';
import { createConfig } from '@tokenami/css';

export default createConfig({
  ...designSystem,
  include: [
    './src/**/*.{ts,tsx}',
    './node_modules/@tokenami/example-design-system/dist/tokenami.css',
  ],
  properties: {
    ...designSystem.properties,
    content: ['pet'],
  },
  selectors: {
    ...designSystem.selectors,
    'child-p': '& > p',
    'prose-p': '& p',
    'prose-card': '& .card',
  },
  theme: {
    ...designSystem.theme,
    modes: {
      root: {
        ...designSystem.theme.modes.root,
        pet: { favourite: '"🐶"' },
      },
      light: {
        ...designSystem.theme.modes.light,
        pet: { favourite: '"🐶"' },
      },
      dark: {
        ...designSystem.theme.modes.dark,
        pet: { favourite: '"🐱"' },
      },
    },
  },
});
