import designSystemConfig from '@tokenami/example-design-system';
import { createConfig } from '@tokenami/css';

export default createConfig({
  ...designSystemConfig,
  include: [
    './src/**/*.{ts,tsx}',
    './node_modules/@tokenami/example-design-system/dist/tokenami.css',
  ],
});
