import { describe, beforeEach, it, expect } from 'vitest';
import { css } from '../css';

/* -------------------------------------------------------------------------------------------------
 * tests
 * -----------------------------------------------------------------------------------------------*/

interface TestContext {
  output: {};
}

describe('css utility', () => {
  describe('when called with a grid value', () => {
    beforeEach<TestContext>((context) => {
      context.output = css({ '--padding-left': 10 });
    });

    it<TestContext>('should convert value to calc', (context) => {
      expect(context.output).toEqual({ '--padding-left': 'calc(var(--_grid) * 10)' });
    });
  });

  describe('when called with a shorthand after a longhand in base styles', () => {
    beforeEach<TestContext>((context) => {
      context.output = css({ '--padding-left': 10, '--padding': 20 });
    });

    it<TestContext>('should keep the shorthand styles only', (context) => {
      expect(context.output).toEqual({ '--padding': 'calc(var(--_grid) * 20)' });
    });
  });
});
