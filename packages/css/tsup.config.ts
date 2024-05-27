import { defineConfig } from 'tsup';
import { exec } from 'child_process';

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['cjs', 'esm'],
  splitting: false,
  treeshake: true,
  clean: true,
  onSuccess: async () => {
    exec('tsc ./src/index.ts --outDir dist --emitDeclarationOnly --declaration --declarationMap');
  },
});
