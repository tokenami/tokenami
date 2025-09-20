import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import * as mockLibrary from '@/mock/library';
import { css, type TokenamiStyle, type TokenValue } from '@/css';

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
 * Frame
 * -----------------------------------------------------------------------------------------------*/

interface FrameProps extends TokenamiStyle<React.ComponentProps<'div'>> {
  asChild?: boolean;
  color?: Color;
}

const Frame = ({ asChild = false, color, ...props }: FrameProps) => {
  const Comp = asChild ? Slot : 'div';
  const [cn, css] = frame();
  return (
    <Comp
      {...props}
      className={cn(props.className)}
      style={css(color && { '--gradient-from': COLORS[color] }, props.style)}
    />
  );
};

Frame.displayName = 'Frame';

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
