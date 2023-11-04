import type * as CSS from 'csstype';
import type * as ConfigUtils from '@tokenami/config';

type Config = ConfigUtils.Config;

declare global {
  // consumer will override this interface
  interface TokenamiConfig {}
  interface TokenamiFinalConfig extends Omit<Config, keyof TokenamiConfig>, TokenamiConfig {}
}

type PropertyConfig = TokenamiFinalConfig['properties'];
type Media = keyof TokenamiFinalConfig['media'];

type Prefix<P = any> = P extends keyof PropertyConfig
  ? Exclude<PropertyConfig[P][number], 'grid'>
  : never;

type Values<P> = P extends keyof TokenamiFinalConfig['theme']
  ? keyof TokenamiFinalConfig['theme'][P]
  : never;

type TokenValue<P, Pfx = Prefix<P>, V = Values<Pfx>> = Pfx extends string
  ? V extends string
    ? ConfigUtils.TokenValue<Pfx, V>
    : never
  : never;

type CSSPropertyValue<P> = P extends keyof CSS.PropertiesHyphen ? CSS.PropertiesHyphen[P] : never;
type ThemedValue<P extends string> = TokenValue<P> | ConfigUtils.ArbitraryValue;
type ThemedGridValue<P extends string> =
  | TokenValue<P>
  | ConfigUtils.ArbitraryValue
  | ConfigUtils.GridValue;

type TokenamiStyles = {} /* TOKENAMI_STYLES */;

declare module 'csstype' {
  interface Properties extends TokenamiStyles {
    [cssProperty: string]: any;
  }
}

export type { Config, TokenamiStyles };
