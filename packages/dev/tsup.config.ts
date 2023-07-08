import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  shims: true,
  dts: {
    banner: '/// <reference path="dev.d.ts" />',
  },
});
