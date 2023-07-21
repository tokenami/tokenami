import * as CSS from 'csstype';
import { type TokenamiProperty, SHEET_CONFIG, THEME_CONFIG } from '@tokenami/config';

interface Theme {}
type SheetConfig = typeof SHEET_CONFIG;
type TokensConfig = typeof THEME_CONFIG;
type ThemeKey<P> = P extends TokenamiProperty ? SheetConfig['themeConfig'][P]['themeKey'] : never;
type Values<P> = ThemeKey<P> extends keyof Theme ? keyof Theme[ThemeKey<P>] : never;
type Prefix<P> = ThemeKey<P> extends keyof TokensConfig
  ? TokensConfig[ThemeKey<P>]['prefix']
  : never;

type GenericValue<P extends keyof CSS.PropertiesHyphen> = CSS.PropertiesHyphen[P];
type ThemeValue<P> = Prefix<P> extends string
  ? Values<P> extends string
    ? `var(--${Prefix<P>}-${Values<P>})`
    : never
  : never;

declare module 'csstype' {
  interface Properties {
    // TOKENAMI_TOKENS_START
    // TOKENAMI_TOKENS_END
    [key: `--${string}`]: string | number;
  }
}
