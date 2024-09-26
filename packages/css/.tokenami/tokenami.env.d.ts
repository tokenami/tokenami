import config from './tokenami.config';

export type Config = typeof config;

declare module '@tokenami/css' {
  interface TokenamiConfig extends Config {}
  interface TokenamiProperties {}
}
