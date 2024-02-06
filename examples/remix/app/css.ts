import { type Variants, createCss } from '@tokenami/css';
import config from '../.tokenami/tokenami.config';

export type { Variants };
export const css = createCss(config);
