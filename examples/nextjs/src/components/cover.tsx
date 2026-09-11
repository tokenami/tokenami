import * as React from 'react';
import { type TokenamiStyle, type Variants, css } from '../css';

/* -------------------------------------------------------------------------------------------------
 * Cover
 * -----------------------------------------------------------------------------------------------*/

export interface CoverProps
  extends Omit<TokenamiStyle<React.ComponentProps<'div'>>, 'color'>,
    Variants<typeof cover> {}

function Cover({ color, size = 'md', ...props }: CoverProps) {
  const [cn, sx] = cover({ size, color });
  return <div {...props} className={cn(props.className)} style={sx(props.style)} />;
}

/* ---------------------------------------------------------------------------------------------- */

const cover = css.compose({
  '--border-radius': 'var(--radii_base)',
  '--background-color': 'var(--color_iris9)',

  variants: {
    size: {
      sm: { '--size': 9 },
      md: { '--size': 11 },
      lg: { '--size': 13 },
      xl: { '--size': 20 },
      '2xl': { '--size': 40 },
      '3xl': { '--size': 55 },
    },
    color: {
      green: { '--background-color': 'var(--color_green9)' },
      sky: { '--background-color': 'var(--color_sky9)' },
      orange: { '--background-color': 'var(--color_orange9)' },
      yellow: { '--background-color': 'var(--color_yellow9)' },
      iris: { '--background-color': 'var(--color_iris9)' },
      crimson: { '--background-color': 'var(--color_crimson9)' },
    },
  },
});

export { Cover };
