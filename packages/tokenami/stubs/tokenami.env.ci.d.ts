/// <reference types="./tokenami.env.d.ts" />
import type { Config } from './tokenami.env.js';

declare module 'tokenami' {
  interface TokenamiConfig extends Config {
    CI: true;
  }
}
