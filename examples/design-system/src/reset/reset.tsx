import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { type TokenamiStyle, css } from '~/css';

/* -------------------------------------------------------------------------------------------------
 * Reset
 * -----------------------------------------------------------------------------------------------*/

type ResetElement = React.ElementRef<'div'>;
type ResetElementProps = React.ComponentPropsWithoutRef<'div'>;
interface ResetProps extends TokenamiStyle<ResetElementProps> {
  asChild?: boolean;
}

const Reset = React.forwardRef<ResetElement, ResetProps>((props, forwardedRef) => {
  const { asChild, ...resetProps } = props;
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      {...resetProps}
      ref={forwardedRef}
      style={css(
        {
          '--font-family': 'var(--font_sans)',
          '--child_box-sizing': 'border-box',
          '--child_m': 0,
          '--child_p': 0,
        },
        props.style
      )}
    />
  );
});

/* ---------------------------------------------------------------------------------------------- */

export { Reset };
