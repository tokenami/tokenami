import { describe, beforeEach, it, expect } from 'vitest';
import { css } from '@tokenami/css';

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
      expect(context.output).toEqual({ '--padding-left': 10, '--padding-left__calc': '/*on*/' });
    });
  });

  describe('when called with a shorthand after a longhand in base styles', () => {
    beforeEach<TestContext>((context) => {
      context.output = css({ '--padding-left': 10, '--padding': 20 });
    });

    it<TestContext>('should keep the shorthand styles only', (context) => {
      expect(context.output).toEqual({ '--padding': 20, '--padding__calc': '/*on*/' });
    });
  });

  describe('when called with a non-numeric override', () => {
    beforeEach<TestContext>((context) => {
      context.output = css({ '--padding': 20 }, { '--padding': 'var(---, 30px)' });
    });

    it<TestContext>('should remove calc toggle', (context) => {
      expect(context.output).toEqual({ '--padding': 'var(---, 30px)' });
    });
  });
});
