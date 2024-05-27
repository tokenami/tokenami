import { defineConfig } from 'tsup';
import { exec } from 'child_process';

export default defineConfig({
  entry: ['./src'],
  format: ['cjs', 'esm'],
  splitting: false,
  treeshake: true,
  clean: true,
  onSuccess: async () => {
    exec('tsc --emitDeclarationOnly --declaration');
  },
});
