import * as React from 'react';
import * as mockLibrary from '@/mock/library';
import { type TokenamiStyle, type Variants, type TokenValue, css } from '@/css';

type Color = (typeof mockLibrary.colors)[number];

const COLORS = {
  green: 'var(--color_green9)',
  sky: 'var(--color_sky9)',
  orange: 'var(--color_orange9)',
  yellow: 'var(--color_yellow9)',
  iris: 'var(--color_iris9)',
  crimson: 'var(--color_crimson9)',
} satisfies Record<Color, TokenValue<'color'>>;

/* -------------------------------------------------------------------------------------------------
 * Cover
 * -----------------------------------------------------------------------------------------------*/

interface CoverProps extends TokenamiStyle<React.ComponentProps<'div'>>, Variants<typeof cover> {
  color?: Color;
}

const Cover = ({ color, size = 'md', ...props }: CoverProps) => {
  const [cn, css] = cover({ size });
  return (
    <div
      {...props}
      className={cn(props.className)}
      style={css(color && { '--background-color': COLORS[color] }, props.style)}
    />
  );
};

Cover.displayName = 'Cover';

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
  },
});

export { Cover };
