import * as React from 'react';
import { type Variants, type TokenamiStyle, css } from '~/css';

/* -------------------------------------------------------------------------------------------------
 * Button
 * -----------------------------------------------------------------------------------------------*/

type ButtonElementProps = React.ComponentPropsWithoutRef<'button'>;
interface ButtonProps extends TokenamiStyle<ButtonElementProps>, Variants<typeof button> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, forwardedRef) => {
  const { size = 'small', children, ...buttonProps } = props;
  return (
    <button type="button" {...buttonProps} ref={forwardedRef} style={button({ size }, props.style)}>
      {children}
    </button>
  );
});

const button = css.compose({
  '--bg-gradient': 'var(--gradient_to-r)',
  '--from': 'var(--bg_violet-700)',
  '--to': 'var(--bg_green-600)',
  '--via': 'var(--bg_amber-400)',
  '--width': 'var(---, 1000px)',
  '--height': 'var(---, 1000px)',
  '--accent': 'var(--accent_slate-100)',
  '--inset': 'var(--inset_1/2)',

  responsiveVariants: {
    size: {
      small: {
        '--font-size': 'var(---,20px)',
      },
      large: {
        '--font-size': 'var(---,25px)',
      },
    },
  },
});

/* ---------------------------------------------------------------------------------------------- */

export { Button };
