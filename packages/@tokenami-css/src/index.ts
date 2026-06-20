import { type TokenamiProperties } from './declarations';
import { type TokenamiCSS, type TokenamiComposeOutput, type Variants as CSSVariants } from './css';

export type TokenamiStyle<P> = P & { style?: TokenamiProperties | TokenamiCSS };
export type Variants<T> = T extends TokenamiComposeOutput<infer V> ? CSSVariants<V> : {};

export type { TokenamiConfig, TokenamiProperties, TokenValue } from './declarations';
export { type Config, createConfig } from '@tokenami/config';
export { type TokenamiCSS, createCss, css } from './css';
