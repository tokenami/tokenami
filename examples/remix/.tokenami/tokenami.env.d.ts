import config from './tokenami.config';

export type Config = typeof config;

declare module '@tokenami/dev' {
  interface TokenamiConfig extends Config {}
}
