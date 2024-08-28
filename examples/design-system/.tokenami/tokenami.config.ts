import designSystem from '@tokenami/ds';
import { createConfig } from '@tokenami/css';

export default createConfig({
  ...designSystem,
  include: ['./src/**/*.{ts,tsx}'],
});
