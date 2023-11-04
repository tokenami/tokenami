import type config from './tokenami.config.cjs';
type CustomConfig = typeof config;

declare global {
  interface TokenamiConfig extends CustomConfig {}
}
