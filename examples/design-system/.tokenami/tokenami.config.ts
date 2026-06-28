import designSystem from '@tokenami/ds';
import { createConfig } from '@tokenami/css';

export default createConfig({
  ...designSystem,
  globalStyles: {
    ...designSystem.globalStyles,
    ':root': {
      ...designSystem.globalStyles[':root'],
      ['--font-family' as string]: `"Geist Variable", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
      ['---focus-ring' as string]: '2px solid white',
      ['---focus-ring-offset' as string]: '-2px',
    },
    'code, kbd, samp, pre': {
      ...designSystem.globalStyles['code, kbd, samp, pre'],
      ['--font-family' as string]: `"Geist Mono Variable", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
    },
    '*:focus-visible': {
      outline: 'var(---focus-ring)',
      outlineOffset: 'var(---focus-ring-offset)',
    },
  },
  include: ['./src/**/*.{ts,tsx}'],
  theme: {
    ...designSystem.theme,
    root: {
      ...designSystem.theme.root,
      line: {
        ...designSystem.theme.root.line,
        ring: 'var(---focus-ring)',
      },
      offset: {
        ...designSystem.theme.root.offset,
        ring: 'var(---focus-ring-offset)',
      },
    },
  },
  selectors: {
    ...designSystem.selectors,
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
    ...designSystem.aliases,
    'scrollbar-width': ['-ms-overflow-style'],
  },
  properties: {
    ...designSystem.properties,
    '-ms-overflow-style': [],
  },
});
