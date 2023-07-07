import type { Theme } from '~/theme';
import type { TokenamiProperty } from '~/sheet/constants';

interface Config {
  include: string[];
  exclude?: string[];
  aliases?: Partial<Record<TokenamiProperty, string[]>>;
  theme: Theme;
}
/* ---------------------------------------------------------------------------------------------- */

export type { Config };
