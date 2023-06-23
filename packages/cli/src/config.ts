type BpMinWidth = `min-width: ${string}`;
type BpMaxWidth = `max-width: ${string}`;
type Breakpoint = `(${BpMinWidth}) | (${BpMaxWidth}) | (${BpMinWidth} and ${BpMaxWidth})`;

interface Config {
  include: string[];
  theme: {
    space: string;
    breakpoints: Record<string, Breakpoint>;
    colors: Record<string, string>;
    radii: Record<string, string>;
  };
}

const defaultConfig: Config = {
  include: [],
  theme: {
    space: '1px',
    breakpoints: {},
    colors: {},
    radii: {},
  },
};

/* ---------------------------------------------------------------------------------------------- */

export type { Config };
export { defaultConfig };
