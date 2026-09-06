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
  it('emits only used grid multipliers at the root, shared by aliases and variants', () => {
    const sheet = createSheet({
      config: {
        ...testConfig,
        properties: { ...testConfig.properties, padding: ['grid'], 'z-index': ['number'] },
        customProperties: { size: ['grid'], count: ['number'] },
      },
      tokens: {
        properties: [
          '--height',
          '--hover_height',
          '--{&:focus}_height',
          '--z-index',
          '--size',
          '--count',
        ],
        values: [],
        composeBlocks: {},
      },
    });

    expect(sheet).toMatch(/:root\s*{[^}]*--block-size__calc: var\(--_grid\)/);
    expect(sheet).toMatch(/:root\s*{[^}]*--size__calc: var\(--_grid\)/);
    expect(sheet.match(/--block-size__calc:/g)).toHaveLength(1);
    expect(sheet).not.toContain('--height__calc');
    expect(sheet).not.toContain('--hover_block-size__calc');
    expect(sheet).not.toContain('--z-index__calc:');
    expect(sheet).not.toContain('--count__calc:');
    expect(sheet).not.toContain('--padding__calc:');
    expect(sheet).not.toContain('__calc: initial');
  });

  it('converts composed numbers while preserving strings, variables and keywords', () => {
    const sheet = createSheet({
      config: {
        ...testConfig,
        properties: { ...testConfig.properties, 'z-index': ['number'] },
      },
      tokens: {
        properties: ['--height', '--hover_height', '--z-index'],
        values: [],
        composeBlocks: {
          '.numeric': { '--height': 4, '--hover_height': '2', '--z-index': 3 } as any,
          '.variable': { '--height': 'var(--space_large)' } as any,
          '.keyword': { '--height': 'auto' } as any,
        },
      },
    });

    expect(sheet).toContain('--block-size: calc(4 * var(--block-size__calc, 1))');
    expect(sheet).toContain('--hover_block-size: 2');
    expect(sheet).toContain('--z-index: calc(3 * var(--z-index__calc, 1))');
    expect(sheet).toContain('--block-size: var(--space_large)');
    expect(sheet).toContain('--block-size: auto');
    expect(sheet).not.toContain('--z-index__calc:');
  });

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

  it('emits custom-property-backed theme tokens on the theme scope only', () => {
    const sheet = createSheet({
      config: {
        ...testConfig,
        theme: {
          gradient: {
            'to-b':
              'linear-gradient(to bottom in var(--color-space, srgb), var(--gradient-from) var(--gradient-from-stop, ), var(---via, var(--gradient-to) var(--gradient-to-stop, ))); ---via: var(--gradient-via) var(--gradient-via-stop, ), var(--gradient-to)',
          },
        },
        properties: {
          'background-image': ['gradient'],
        },
        customProperties: {
          'color-space': ['color-space'],
          'gradient-from': ['color'],
          'gradient-from-stop': ['stop'],
          'gradient-to': ['color'],
          'gradient-to-stop': ['stop'],
          'gradient-via': ['color'],
          'gradient-via-stop': ['stop'],
        },
      },
      tokens: {
        properties: ['--background-image'],
        values: ['var(--gradient_to-b)'],
        composeBlocks: {},
      },
    });

    expect(sheet).toMatch(
      /:root,\s*:root :where\(\[style\]\)\s*{\s*--gradient_to-b:\s*linear-gradient\(to bottom in var\(--_color-space, srgb\)/
    );
    expect(sheet).not.toContain(':root *');
    expect(sheet).not.toContain(':root [style]');
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
    expect(sheet).toContain('--block-size: calc(10 * var(--block-size__calc, 1))');
    expect(sheet).toContain('--hover_block-size: calc(20 * var(--block-size__calc, 1))');
    expect(sheet).toMatch(
      /@layer tkc\s*{\s*\.tk-child\s*{\s*block-size: var\(--block-size, inherit\)/
    );
    expect(sheet).toContain('--block-size__calc: var(--_grid)');
    expect(sheet).not.toContain('__calc: initial');
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
