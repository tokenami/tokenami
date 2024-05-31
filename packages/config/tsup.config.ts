import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src'],
  format: ['cjs', 'esm'],
  splitting: false,
  treeshake: true,
  clean: true,
  dts: true,
});
