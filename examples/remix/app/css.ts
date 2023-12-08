import { type VariantProps, createCss } from '@tokenami/css';
import config from '../.tokenami/tokenami.config.cjs';

const css = createCss(config);

export type { VariantProps };
export { css };
