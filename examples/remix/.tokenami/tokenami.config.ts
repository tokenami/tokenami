import { tokenamiConfig as designSystemConfig } from '@tokenami/example-design-system';
import { createConfig } from '@tokenami/css';

export default createConfig({
  ...designSystemConfig,
  include: [
    './app/**/*.{ts,tsx}',
    'node_modules/@tokenami/example-design-system/dist/tokenami.css',
  ],
  exclude: ['./app/routes/original.tsx', './app/test.tsx'],
  theme: {
    ...designSystemConfig.theme,
    pet: {
      cat: '"🐱"',
      dog: '"🐶"',
    },
  },
  properties: {
    ...designSystemConfig.properties,
    content: ['pet'],
  },
});
