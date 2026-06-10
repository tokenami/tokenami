import config from './tokenami.config.js';

export type Config = typeof config;

declare module 'tokenami' {
  interface TokenamiConfig extends Config {}
}
