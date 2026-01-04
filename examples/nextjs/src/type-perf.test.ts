import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import path from 'node:path';

/* -------------------------------------------------------------------------------------------------
 * tests
 * -----------------------------------------------------------------------------------------------*/

// we'll try to improve this over time
const TIMEOUT_MS = 15000;
const cwd = path.resolve(__dirname, '..');

describe('type checking performance', () => {
  it(`should complete tsc + tokenami check within ${TIMEOUT_MS}ms`, () => {
    const start = Date.now();

    // Run tsc --noEmit
    execSync('pnpm tsc --noEmit', { cwd, stdio: 'pipe' });

    // Run tokenami check
    execSync('pnpm tokenami check', { cwd, stdio: 'pipe' });

    const duration = Date.now() - start;

    expect(duration).toBeLessThan(TIMEOUT_MS);
    console.log(`Type checking completed in ${duration}ms`);
  });
});
