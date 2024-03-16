import * as React from 'react';
import { type Variants, type TokenamiStyle, css } from '@tokenami/css';

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
  '--bg-color': 'var(--color_slate-100)',
  '--border': 'var(---,none)',
  '--border-bottom': 'var(---, 2px solid var(--color_slate-700))',
  '--border-radius': 'var(--radii_rounded)',
  '--font-family': 'var(--font_sans)',
  '--width': 'var(---,180px)',
  '--height': 15,
  '--transition': 'var(---,all 150ms)',

  '--hover_background-color': 'var(--color_slate-700)',
  '--hover_color': 'var(---,white)',
  '--hover_animation': 'var(--anim_wiggle)',

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
