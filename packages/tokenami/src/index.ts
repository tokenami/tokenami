import { createTSPlugin } from './ts-plugin';

interface TypeScriptPluginModule {
  typescript: typeof import('typescript');
}

function tokenami(mod: TypeScriptPluginModule) {
  if (mod && typeof mod === 'object' && 'typescript' in mod) {
    return createTSPlugin(mod);
  }

  throw new Error('Tokenami only supports importing types from the root module.');
}

export default tokenami;
export type * from './declarations';
