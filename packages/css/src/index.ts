import type { TokenamiProperties } from './declarations';
import type { TokenamiCSS } from './css';

export type TokenamiStyle<P> = Omit<P, 'style'> & {
  style?: (TokenamiProperties | TokenamiCSS) & ('style' extends keyof P ? P['style'] : {});
};

export type Variants<T extends (...args: any) => any> = Parameters<T>[0] extends undefined | null
  ? {}
  : NonNullable<Parameters<T>[0]>;

export type * from './declarations';
export { type Config, createConfig } from '@tokenami/config';
export { type TokenamiCSS, createCss, css } from './css';
