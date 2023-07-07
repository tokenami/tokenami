import type * as CSS from 'csstype';

type BpMinWidth = `min-width: ${string}`;
type BpMaxWidth = `max-width: ${string}`;
type Breakpoint = `(${BpMinWidth}) | (${BpMaxWidth}) | (${BpMinWidth} and ${BpMaxWidth})`;

interface Config {
  include: string[];
  exclude?: string[];
  aliases?: Partial<Record<keyof CSS.PropertiesHyphen, string[]>>;
  theme: {
    space: string;
    breakpoints: Record<string, Breakpoint>;
    colors: Record<string, string>;
    radii: Record<string, string>;
  };
}
/* ---------------------------------------------------------------------------------------------- */

export type { Config };
