import type config from './tokenami.config';
type CustomConfig = typeof config;

declare global {
  interface TokenamiConfig extends CustomConfig {}
}
