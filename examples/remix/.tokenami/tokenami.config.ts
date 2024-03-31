import designSystemConfig from '@tokenami/example-design-system';
import { createConfig } from '@tokenami/css';

export default createConfig({
  ...designSystemConfig,
  exclude: ['./app/routes/original.tsx', './app/test.tsx'],
  include: [
    './app/**/*.{ts,tsx}',
    './node_modules/@tokenami/example-design-system/dist/tokenami.css',
  ],
  properties: {
    ...designSystemConfig.properties,
    content: ['pet'],
  },
  selectors: {
    ...designSystemConfig.selectors,
    selection: '&::selection',
  },
  theme: {
    modes: {
      ...designSystemConfig.theme.modes,
      light: {
        ...designSystemConfig.theme.modes.light,
        pet: {
          favourite: '"🐶"',
        },
      },
      dark: {
        ...designSystemConfig.theme.modes.dark,
        pet: {
          favourite: '"🐱"',
        },
      },
    },
  },
});
