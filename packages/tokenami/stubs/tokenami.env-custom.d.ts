import { type TokenProperties } from 'tokenami';
import config from './tokenami.config.js';

export type Config = typeof config;

declare module 'tokenami' {
  interface TokenamiConfig extends Config {}
  interface TokenamiProperties {}
}
