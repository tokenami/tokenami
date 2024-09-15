import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@tokenami/css': path.resolve(__dirname, 'src'),
    },
  },
});
