import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { css, type Variants, type TokenamiStyle } from '@/css';

/* -------------------------------------------------------------------------------------------------
 * Frame
 * -----------------------------------------------------------------------------------------------*/

interface FrameProps
  extends Omit<TokenamiStyle<React.ComponentProps<'div'>>, 'color'>,
    Variants<typeof frame> {
  asChild?: boolean;
}

const Frame = ({ asChild = false, color, ...props }: FrameProps) => {
  const Comp = asChild ? Slot : 'div';
  const [cn, sx] = frame({ color });
  return <Comp {...props} className={cn(props.className)} style={sx(props.style)} />;
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

  variants: {
    color: {
      green: { '--gradient-from': 'var(--color_green9)' },
      sky: { '--gradient-from': 'var(--color_sky9)' },
      orange: { '--gradient-from': 'var(--color_orange9)' },
      yellow: { '--gradient-from': 'var(--color_yellow9)' },
      iris: { '--gradient-from': 'var(--color_iris9)' },
      crimson: { '--gradient-from': 'var(--color_crimson9)' },
    },
  },
});

export { Frame };
