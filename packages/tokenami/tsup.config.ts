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
    clean: false,
    shims: true,
    dts: false,
  },
  {
    entry: ['./src/vite.ts', './src/rollup.ts', './src/esbuild.ts'],
    format: ['esm'],
    splitting: false,
    treeshake: true,
    clean: false,
    shims: true,
    dts: true,
  },
  {
    entry: ['./src/webpack.ts'],
    format: ['cjs', 'esm'],
    splitting: false,
    treeshake: true,
    clean: false,
    shims: true,
    dts: true,
  },
]);
