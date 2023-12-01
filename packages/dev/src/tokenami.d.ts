import type * as CSS from 'csstype';
import type * as ConfigUtils from '@tokenami/config';

type Merge<A, B> = Omit<A, keyof B> & B;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

declare global {
  // consumer will override this interface
  interface TokenamiConfig {}
  interface TokenamiFinalConfig extends Merge<ConfigUtils.DefaultConfig, TokenamiConfig> {}

  type TokenamiBaseStyles = {} /* TOKENAMI_STYLES */;

  type TokenamiAliasStyles = {
    [K in keyof TokenamiFinalConfig['aliases']]: TokenamiFinalConfig['aliases'][K][number] extends infer L
      ? L extends ConfigUtils.CSSProperty
        ? VariantStyle<K, Responsive, TokenamiBaseStyles[ConfigUtils.TokenProperty<L>]>
        : never
      : never;
  }[keyof TokenamiFinalConfig['aliases']];

  interface TokenamiStyles extends TokenamiBaseStyles, UnionToIntersection<TokenamiAliasStyles> {}
}

type PropertyConfig = NonNullable<TokenamiFinalConfig['properties']>;
type Responsive = keyof NonNullable<TokenamiFinalConfig['responsive']>;

type Style<P extends string, V> = { [key in ConfigUtils.TokenProperty<P>]?: V };
type VariantStyle<P extends string, K extends string, V> = Style<P, V> &
  Style<`${K}_${P}`, V> &
  Style<`${string}_${P}`, V>;

type ThemeKey<P> = P extends keyof PropertyConfig
  ? Exclude<NonNullable<PropertyConfig[P]>[number], 'grid'>
  : never;

type ThemeValue<TK> = TK extends keyof TokenamiFinalConfig['theme']
  ? keyof TokenamiFinalConfig['theme'][TK]
  : never;

type TokenValue<P> = ThemeKey<P> extends infer TK
  ? TK extends string
    ? ThemeValue<TK> extends infer TV
      ? TV extends string
        ? ConfigUtils.TokenValue<TK, TV>
        : never
      : never
    : never
  : never;

type Value<P extends keyof TokenamiFinalConfig['properties']> =
  TokenamiFinalConfig['properties'][P][number] extends infer ThemeKey
    ? ThemeKey extends 'grid'
      ? TokenValue<P> | ConfigUtils.ArbitraryValue | ConfigUtils.GridValue
      : TokenValue<P> | ConfigUtils.ArbitraryValue
    : never;

type CSSPropertyValue<P> = P extends keyof CSS.PropertiesHyphen ? CSS.PropertiesHyphen[P] : never;

declare module 'csstype' {
  interface Properties extends TokenamiStyles {
    [key: `---${string}`]: any;
  }
}
