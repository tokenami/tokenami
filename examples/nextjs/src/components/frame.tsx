import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { css, type TokenamiStyle, type TokenamiProperties } from '@/css';

/* -------------------------------------------------------------------------------------------------
 * Frame
 * -----------------------------------------------------------------------------------------------*/

interface FrameProps extends TokenamiStyle<React.ComponentProps<'div'>> {
  asChild?: boolean;
  fade?: TokenamiProperties['--gradient-from'];
}

const Frame = ({ asChild = false, fade, ...props }: FrameProps) => {
  const [cn, css] = frame();
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      {...props}
      className={cn(props.className)}
      style={css(fade && { '--gradient-from': fade }, props.style)}
    />
  );
};

Frame.displayName = 'Frame';

/* ---------------------------------------------------------------------------------------------- */

const frame = css.compose({
  '--background-image': 'var(--gradient_to-b)',
  '--gradient-from': 'var(--color_gray2)',
  '--gradient-to': 'var(--color_gray2)',
  '--gradient-to-stop': 'var(--stop_60)',
  '--border-radius': 'var(--radii_md)',
  '--overflow-y': 'auto',
  '--p': 2,
});

export { Frame };
