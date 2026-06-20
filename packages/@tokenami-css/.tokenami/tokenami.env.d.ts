import config from './tokenami.config';

export type Config = typeof config;

declare module '../src/declarations' {
  interface TokenamiConfig extends Config {}
}
