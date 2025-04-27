import * as React from 'react';
import { type TokenamiProperties, type TokenamiStyle, type Variants, css } from '@/css';

/* -------------------------------------------------------------------------------------------------
 * Cover
 * -----------------------------------------------------------------------------------------------*/

interface CoverProps extends TokenamiStyle<React.ComponentProps<'div'>>, Variants<typeof cover> {
  color?: TokenamiProperties['--background-color'];
}

const Cover = ({ color, size = 'md', ...props }: CoverProps) => {
  const [cn, css] = cover({ size });
  return (
    <div
      {...props}
      className={cn(props.className)}
      style={css(color && { '--background-color': color }, props.style)}
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
