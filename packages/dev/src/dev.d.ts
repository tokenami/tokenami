import 'csstype';
import * as Tokenami from '@tokenami/config';

interface Config extends Tokenami.Config {}

type PropertyConfig = Config['properties'];

type Prefix<P = any> = P extends keyof PropertyConfig
  ? Exclude<PropertyConfig[P][number], 'grid'>
  : never;

type Values<Pfx extends Prefix> = Pfx extends keyof Config['theme']
  ? keyof Config['theme'][Pfx]
  : never;

type TokenValue<P> = Prefix<P> extends string
  ? Values<Prefix<P>> extends string
    ? Tokenami.TokenValue<Prefix<P>, Values<Prefix<P>>>
    : never
  : never;

type AllProperties = Partial<{
  [key in Tokenami.TokenProperty<Tokenami.CSSProperty>]: Tokenami.AnyValue;
}>;

declare module 'csstype' {
  interface Properties extends AllProperties {
    // TOKENAMI_TOKENS_START
    // TOKENAMI_TOKENS_END
    [key: `--${string}`]: string | number;
  }
}
