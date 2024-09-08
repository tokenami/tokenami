import type { TokenamiCSS } from './css';

export type TokenamiStyle<P> = {
  [K in keyof P]: K extends 'style' ? TokenamiCSS & P[K] : P[K];
};

export type Variants<T extends (...args: any) => any> = Parameters<T>[0] extends undefined | null
  ? {}
  : NonNullable<Parameters<T>[0]>;

export { type Config, createConfig } from '@tokenami/config';
export { type TokenamiCSS, type CSS, createCss, css } from './css';
export type {
  TokenamiProperties,
  TokenamiPropertiesOmit,
  TokenamiPropertiesPick,
} from '@tokenami/dev';
