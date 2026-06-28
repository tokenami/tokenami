import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { css, type TokenamiStyle, type TokenValue } from '../css';

type Color = 'green' | 'sky' | 'orange' | 'yellow' | 'iris' | 'crimson';

const COLORS = {
  green: 'var(--color_green8)',
  sky: 'var(--color_sky8)',
  orange: 'var(--color_orange8)',
  yellow: 'var(--color_yellow8)',
  iris: 'var(--color_iris8)',
  crimson: 'var(--color_crimson8)',
} satisfies Record<Color, TokenValue<'color'>>;

/* -------------------------------------------------------------------------------------------------
 * Frame
 * -----------------------------------------------------------------------------------------------*/

export interface FrameProps extends TokenamiStyle<React.ComponentProps<'div'>> {
  asChild?: boolean;
  color?: Color;
}

function Frame({ asChild = false, color, ...props }: FrameProps) {
  const Comp = asChild ? Slot : 'div';
  const [cn, css] = frame();
  return (
    <Comp
      {...props}
      className={cn(props.className)}
      style={css(color && { '--gradient-from': COLORS[color] }, props.style)}
    />
  );
}

/* ---------------------------------------------------------------------------------------------- */

const frame = css.compose({
  '--background-image': 'var(--gradient_to-b)',
  '--gradient-from': 'var(--color_gray2)',
  '--gradient-to': 'var(--color_gray2)',
  '--gradient-to-stop': 135,
  '--border-radius': 'var(--radii_md)',
  '--overflow-y': 'auto',
  '--size': 'var(--size_full)',
  '--p': 2,
});

export { Frame };
