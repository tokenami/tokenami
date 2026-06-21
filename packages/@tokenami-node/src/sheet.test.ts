import { describe, expect, it } from 'vitest';
import * as Tokenami from '@tokenami/config';
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
    focus: '&:focus',
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

  it('orders named selector overrides by config order', () => {
    const sheet1 = createSheet({
      config: testConfig,
      tokens: {
        properties: ['--focus_color', '--hover_color'],
        values: [],
        composeBlocks: {},
      },
    });
    const sheet2 = createSheet({
      config: testConfig,
      tokens: {
        properties: ['--hover_color', '--focus_color'],
        values: [],
        composeBlocks: {},
      },
    });

    const hoverProperty = variantProperty('hover', 'color');
    const focusProperty = variantProperty('focus', 'color');
    const result = `color: var(${focusProperty}, var(${hoverProperty}, revert-layer))`;

    expect(sheet1).toContain(result);
    expect(sheet2).toContain(result);
  });

  it('orders named selector overrides after arbitrary selector overrides', () => {
    const sheet1 = createSheet({
      config: testConfig,
      tokens: {
        properties: ['--hover_color', '--{&:hover}_color'],
        values: [],
        composeBlocks: {},
      },
    });
    const sheet2 = createSheet({
      config: testConfig,
      tokens: {
        properties: ['--{&:hover}_color', '--hover_color'],
        values: [],
        composeBlocks: {},
      },
    });

    const arbitraryProperty = variantProperty('{&:hover}', 'color');
    const hoverProperty = variantProperty('hover', 'color');
    const result = `color: var(${hoverProperty}, var(${arbitraryProperty}, revert-layer))`;

    expect(sheet1).toContain(result);
    expect(sheet2).toContain(result);
  });

  it('orders arbitrary selector overrides deterministically', () => {
    const firstSheet = createSheet({
      config: testConfig,
      tokens: {
        properties: ['--{&:focus}_color', '--{&:hover}_color'],
        values: [],
        composeBlocks: {},
      },
    });
    const secondSheet = createSheet({
      config: testConfig,
      tokens: {
        properties: ['--{&:hover}_color', '--{&:focus}_color'],
        values: [],
        composeBlocks: {},
      },
    });

    expect(getColorDeclaration(firstSheet)).toEqual(getColorDeclaration(secondSheet));
  });
});

function variantProperty(variant: string, property: string) {
  return `--_${Tokenami.hash(variant + property)}`;
}

function getColorDeclaration(sheet: string) {
  return sheet.match(/color: var\(--_[^;}]+/)?.[0];
}
