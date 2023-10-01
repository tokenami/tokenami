import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  format: ['cjs', 'esm'],
  dts: { banner: '/// <reference path="./tokenami.d.ts" />' },
  shims: true,
  minify: true,
});
