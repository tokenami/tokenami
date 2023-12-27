import { TokenamiStyles } from '@tokenami/dev';
import config from './tokenami.config';

type Config = typeof config;

declare module '@tokenami/dev' {
  interface TokenamiConfig extends Config {}
}

declare module 'react' {
  interface CSSProperties extends TokenamiStyles {
    [customProperty: `---${string}`]: string | number | undefined;
  }
}
