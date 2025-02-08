import config from './tokenami.config';

export type Config = typeof config;

declare module 'tokenami' {
  interface TokenamiConfig extends Config {}
  interface TokenamiProperties {}
}
