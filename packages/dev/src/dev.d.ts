import type * as CSS from 'csstype';
import * as Tokenami from '@tokenami/config';

interface Config extends Tokenami.Config {}

type PropertyConfig = Config['properties'];
type Media = keyof Config['media'];

type Prefix<P = any> = P extends keyof PropertyConfig
  ? Exclude<PropertyConfig[P][number], 'grid'>
  : never;

type Values<P> = P extends keyof Config['theme'] ? keyof Config['theme'][P] : never;

type TokenValue<P, Pfx = Prefix<P>, V = Values<Pfx>> = Pfx extends string
  ? V extends string
    ? Tokenami.TokenValue<Pfx, V>
    : never
  : never;

type CSSPropertyValue<P> = P extends keyof CSS.PropertiesHyphen ? CSS.PropertiesHyphen[P] : never;
type ThemedValue<P extends string> = TokenValue<P> | Tokenami.ArbitraryValue;
type ThemedGridValue<P extends string> =
  | TokenValue<P>
  | Tokenami.ArbitraryValue
  | Tokenami.GridValue;

declare module 'csstype' {
  interface Properties /*EXTENDS*/ {
    [cssProperty: string]: any;
  }
}
