import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src'],
  format: ['cjs'],
  splitting: false,
  treeshake: true,
  clean: true,
  shims: true,
});
