/// <reference types="./tokenami.env.d.ts" />
import type { Config } from './tokenami.env';

declare module '@tokenami/css' {
  interface TokenamiConfig extends Config {
    CI: true;
  }
}
