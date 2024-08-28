import type { TokenamiCSS } from './css';

export type TokenamiStyle<P> = {
  [K in keyof P]: K extends 'style' ? TokenamiCSS & P[K] : P[K];
};

export type Variants<T extends (...args: any) => any> = Parameters<T>[0] extends undefined | null
  ? {}
  : NonNullable<Parameters<T>[0]>;

export type { TokenamiCSS, CSS } from './css';
export type { Config } from '@tokenami/config';
export { createConfig } from '@tokenami/config';
export { createCss, css } from './css';
