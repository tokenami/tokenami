import { describe, expect, it } from 'vitest';
import type { Config } from '@tokenami/config';
import { createSheet } from './sheet';

const testConfig: Config = {
  include: [],
  themeSelector: () => ':root',
  theme: { color: { accent: '#ff0000' } },
  properties: {
    color: ['color'],
    'background-color': ['color'],
    'block-size': ['grid'],
  },
  aliases: {
    height: ['block-size'],
  },
  grid: '0.25rem',
  selectors: {
    hover: '&:hover',
  },
};

describe('sheet', () => {
  it('does not emit an undefined grid property when grid is not configured', () => {
    const sheet = createSheet({
      config: testConfig,
      tokens: {
        properties: ['--color'],
        values: ['var(--color_accent)'],
        composeBlocks: {},
      },
    });

    expect(sheet).not.toContain('--_grid: undefined');
  });

  it('emits composed inherit values as native properties with token variable fallbacks', () => {
    const sheet = createSheet({
      config: testConfig,
      tokens: {
        properties: ['--hover_background-color', '--background-color'],
        values: ['var(--color_accent)'],
        composeBlocks: {
          '.tk-parent': {
            '--hover_background-color': 'var(--color_accent)',
          },
          '.tk-child': {
            '--background-color': 'inherit',
          },
        },
      },
    });

    expect(sheet).toMatch(
      /@layer tks\d+\s*{\s*\.tk-parent\s*,\s*\[style\]\s*{\s*background-color: var\(--_[^;}]+/
    );
    expect(sheet).toMatch(
      /@layer tkc\s*{\s*\.tk-child\s*{\s*background-color: var\(--background-color, inherit\)/
    );
    expect(sheet).not.toMatch(/@layer tkc\s*{\s*\.tk-child\s*{\s*--background-color: inherit/);
  });

  it('preserves selector overrides when a child inherits a grid-backed property', () => {
    const sheet = createSheet({
      config: testConfig,
      tokens: {
        properties: ['--height', '--hover_height'],
        values: [],
        composeBlocks: {
          '.tk-parent': {
            '--height': 10,
            '--hover_height': 20,
          },
          '.tk-child': {
            '--height': 'inherit',
          },
        },
      },
    });

    expect(sheet).toMatch(
      /@layer tksl\d+\s*{\s*\.tk-parent\s*,\s*\[style\]\s*{\s*block-size: var\(--_[^;}]+/
    );
    expect(sheet).toMatch(/@layer tkc\s*{\s*\.tk-parent\s*{\s*--block-size: 10/);
    expect(sheet).toMatch(/@layer tkc\s*{\s*\.tk-parent\s*{\s*--hover_block-size: 20/);
    expect(sheet).toMatch(
      /@layer tkc\s*{\s*\.tk-child\s*{\s*block-size: var\(--_[^,]+,\s*var\(--block-size, inherit\)\)/
    );
    expect(sheet).toMatch(
      /@layer tkc\s*{\s*\.tk-child\s*{\s*--_[^:]+: var\(--block-size__calc\) calc\(var\(--block-size\) \* var\(--_grid\)\)/
    );
    expect(sheet).not.toMatch(/@layer tkc\s*{\s*\.tk-child\s*{\s*--block-size: inherit/);
  });
});
