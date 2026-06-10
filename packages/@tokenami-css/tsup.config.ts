import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['cjs', 'esm'],
  splitting: false,
  treeshake: true,
  clean: true,
  dts: true,
});
