import designSystemConfig from '@tokenami/ds';
import { createConfig } from '@tokenami/css';

export default createConfig({
  ...designSystemConfig,
  globalStyles: {
    ...designSystemConfig.globalStyles,
    ':root': {
      ...designSystemConfig.globalStyles[':root'],
      ['--focus-ring' as string]: '2px solid white',
      ['--focus-ring-offset' as string]: '-2px',
    },
    '*:focus-visible': {
      outline: 'var(--focus-ring)',
      outlineOffset: 'var(--focus-ring-offset)',
    },
  },
  include: ['./src/**/*.{ts,tsx}'],
  theme: {
    ...designSystemConfig.theme,
    root: {
      ...designSystemConfig.theme.root,
      line: {
        ...designSystemConfig.theme.root.line,
        ring: 'var(--focus-ring)',
      },
      offset: {
        ...designSystemConfig.theme.root.offset,
        ring: 'var(--focus-ring-offset)',
      },
    },
  },
  selectors: {
    ...designSystemConfig.selectors,
    hover: [
      '@media (hover: hover) and (pointer: fine)',
      '&:not(:disabled):hover, &:not(:disabled):focus-visible',
    ],
    'hover-within': [
      '@media (hover: hover) and (pointer: fine)',
      '&:has(:where(a[href],button,input,select,textarea,[tabindex="0"]):not([tabindex="-1"]):not([disabled])):hover, &:has(:focus-visible):focus-within',
    ],
    'focus-within': '&:has(:focus-visible):focus-within',
    'group-hover': ['@media (hover: hover) and (pointer: fine)', '.group:hover &'],
    'webkit-scrollbar': ['&::-webkit-scrollbar'],
  },
  aliases: {
    ...designSystemConfig.aliases,
    'scrollbar-width': ['-ms-overflow-style'],
  },
  properties: {
    ...designSystemConfig.properties,
    '-ms-overflow-style': [],
  },
});
