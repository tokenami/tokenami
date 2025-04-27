import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { css, type TokenamiStyle, type TokenValue } from '@/css';

/* -------------------------------------------------------------------------------------------------
 * Frame
 * -----------------------------------------------------------------------------------------------*/

interface FrameProps extends TokenamiStyle<React.ComponentProps<'div'>> {
  asChild?: boolean;
  color?: TokenValue<'color'>;
}

const Frame = ({ asChild = false, color, ...props }: FrameProps) => {
  const Comp = asChild ? Slot : 'div';
  const [cn, css] = frame();
  return (
    <Comp
      {...props}
      className={cn(props.className)}
      style={css(color && { '--gradient-from': color }, props.style)}
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
