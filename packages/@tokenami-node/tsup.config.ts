import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['./src/index.ts'],
    format: ['esm'],
    splitting: false,
    treeshake: true,
    clean: true,
    shims: true,
    dts: true,
  },
  {
    entry: { 'ts-plugin': './src/ts-plugin/index.ts' },
    format: ['cjs'],
    splitting: false,
    treeshake: true,
    clean: false,
    shims: true,
    dts: true,
  },
]);
