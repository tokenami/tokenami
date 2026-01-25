import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { cwd } from 'node:process';

/* -------------------------------------------------------------------------------------------------
 * TypeScript Plugin CJS Export Tests
 *
 * TypeScript plugins are loaded by tsserver using CommonJS require().
 * The plugin function MUST be exported directly on module.exports (not module.exports.default).
 *
 * tsserver loads plugins like this:
 *   const plugin = require('tokenami');
 *   const init = plugin({ typescript: ts });
 *
 * If the export is wrapped (e.g., module.exports.default), the plugin will fail to load.
 * -----------------------------------------------------------------------------------------------*/

describe('tokenami CJS export', () => {
  const cjsPath = resolve(cwd(), 'dist/index.cjs');

  const loadCjsModule = async () => {
    const module = await import(cjsPath);
    return module.default;
  };

  it('should export the plugin function directly on module.exports', async () => {
    const exported = await loadCjsModule();

    // The export must be a function, not an object with a default property
    expect(typeof exported).toBe('function');
  });

  it('should NOT have a default property wrapping the export', async () => {
    const exported = await loadCjsModule();

    // If there's a default property, the export structure is wrong for TS plugins
    expect(exported).not.toHaveProperty('default');
  });

  it('should return a plugin initializer when called with typescript module', async () => {
    const exported = await loadCjsModule();

    // Mock the typescript module structure that tsserver passes
    const mockTypescript = {
      typescript: {
        sys: {},
        ScriptKind: {},
      },
    };

    // The function should return something (the plugin initializer)
    // without throwing when given a valid typescript module object
    const result = exported(mockTypescript);

    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
    expect(result).toHaveProperty('create');
  });

  it('should throw an error when called without typescript module', async () => {
    const exported = await loadCjsModule();

    expect(() => exported()).toThrow();
    expect(() => exported({})).toThrow();
    expect(() => exported(null)).toThrow();
  });
});
