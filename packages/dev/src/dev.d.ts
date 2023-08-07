import 'csstype';
import * as Tokenami from '@tokenami/config';

interface Config extends Tokenami.Config {}

type PropertyConfig = Config['properties'];

type Prefix<P = any> = P extends keyof PropertyConfig
  ? Exclude<PropertyConfig[P][number], 'grid'>
  : never;

type Values<P> = P extends keyof Config['theme'] ? keyof Config['theme'][P] : never;

type TokenValue<P, Pfx = Prefix<P>, V = Values<Pfx>> = Pfx extends string
  ? V extends string
    ? Tokenami.TokenValue<Pfx, V>
    : never
  : never;

declare module 'csstype' {
  interface Properties {
    // TOKENAMI_TOKENS_START
    // TOKENAMI_TOKENS_END
  }
}
