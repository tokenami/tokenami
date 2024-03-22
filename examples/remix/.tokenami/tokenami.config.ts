import { tokenamiConfig as designSystemConfig } from '@tokenami/example-design-system';
import { createConfig } from '@tokenami/css';

export default createConfig({
  ...designSystemConfig,
  exclude: ['./app/routes/original.tsx', './app/test.tsx'],
  include: [
    './app/**/*.{ts,tsx}',
    './node_modules/@tokenami/example-design-system/dist/tokenami.css',
  ],
});
