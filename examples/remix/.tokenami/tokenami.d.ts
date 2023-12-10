import { TokenamiStyles } from '@tokenami/dev';
import config from './tokenami.config';

type Config = typeof config;

declare module '@tokenami/dev' {
  interface TokenamiConfig extends Config {}
}

declare module 'csstype' {
  interface Properties extends TokenamiStyles {
    [customProperty: `---${string}`]: any;
  }
}
