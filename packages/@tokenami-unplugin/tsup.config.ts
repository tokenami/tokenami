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
]);
