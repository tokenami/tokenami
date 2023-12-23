import { type Variants, createCss } from '@tokenami/css';
import config from '../.tokenami/tokenami.config';

const css = createCss(config);

export type { Variants };
export { css };
