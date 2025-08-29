import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['./src/index.ts'],
    format: ['cjs', 'esm'],
    splitting: false,
    treeshake: true,
    clean: true,
    shims: true,
    dts: true,
  },
  {
    entry: ['./src/cli.ts'],
    format: ['esm'],
    splitting: false,
    treeshake: true,
    clean: true,
    shims: true,
    dts: false,
  },
]);
