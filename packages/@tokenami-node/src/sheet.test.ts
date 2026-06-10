import { describe, expect, it } from 'vitest';
import type { Config } from '@tokenami/config';
import { createSheet } from './sheet';

const testConfig: Config = {
  include: [],
  themeSelector: () => ':root',
  theme: { color: { accent: '#ff0000' } },
  properties: {
    color: ['color'],
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
});
