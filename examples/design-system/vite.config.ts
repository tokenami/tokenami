// <reference types="vite/client" />
import { resolve } from 'path';
import storylitePlugin from '@storylite/vite-plugin';
import * as tokenami from '@tokenami/unplugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'canvas.html'),
      },
    },
  },
  plugins: [
    tokenami.vite({ output: resolve(__dirname, './src/tokenami.css') }),
    storylitePlugin({
      stories: 'src/**/*.stories.tsx',
    }),
    react(),
  ],
  resolve: {
    alias: {
      '~': resolve(__dirname, 'src'),
    },
  },
});
