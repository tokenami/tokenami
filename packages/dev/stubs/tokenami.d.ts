import { TokenamiProperties } from '@tokenami/dev';
import config from './tokenami.config';

type Config = typeof config;

declare module '@tokenami/dev' {
  interface TokenamiConfig extends Config {}
  interface TokenamiProperties {
    [customProperty: `---${string}`]: string | number | undefined;
  }
}

declare module 'react' {
  interface CSSProperties extends TokenamiProperties {}
}
