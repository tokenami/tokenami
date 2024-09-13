import type { TokenamiProperties } from '@tokenami/dev';
import type { TokenamiCSS } from './css';

export type TokenamiStyle<P> = Omit<P, 'style'> & {
  style?: (TokenamiProperties | TokenamiCSS) & ('style' extends keyof P ? P['style'] : {});
};

export type Variants<T extends (...args: any) => any> = Parameters<T>[0] extends undefined | null
  ? {}
  : NonNullable<Parameters<T>[0]>;

export type { TokenamiProperties } from '@tokenami/dev';
export { type Config, createConfig } from '@tokenami/config';
export { type TokenamiCSS, type CSS, createCss, css } from './css';
