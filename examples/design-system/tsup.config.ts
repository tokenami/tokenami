import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts', 'src/css.ts', 'src/utils.ts', 'src/components/!(*.stories).tsx'],
    bundle: false,
    external: [/\.svg$/],
    format: ['esm'],
    dts: true,
  },
  {
    entry: ['.tokenami/tokenami.config.ts'],
    outDir: 'dist',
    format: ['esm'],
    dts: true,
  },
]);
