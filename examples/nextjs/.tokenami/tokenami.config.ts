import designSystemConfig from '@tokenami/ds';
import { createConfig } from '@tokenami/css';

export default createConfig({
  ...designSystemConfig,
  include: ['./src/**/*.{ts,tsx}'],
  selectors: {
    ...designSystemConfig.selectors,
    'group-hover': ['@media (hover: hover) and (pointer: fine)', '.group:hover &'],
    'hover-within': ['@media (hover: hover) and (pointer: fine)', '&:has(.hover):hover'],
    'focus-within': '&:has(:focus-visible):focus-within',
  },
});
