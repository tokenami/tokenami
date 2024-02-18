import { createCss } from '@tokenami/css';
import config from '../.tokenami/tokenami.config';

export type * from '@tokenami/css';
export const css = createCss(config);
