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
  '--bg-color': 'var(--color_primary)',
  '--color': 'var(--color_secondary)',
  '--border': 'var(---,none)',
  '--border-bottom': 'var(--border_thin)',
  '--border-radius': 'var(--radii_rounded)',
  '--font-family': 'var(--font_sans)',
  '--width': 'var(---,180px)',
  '--height': 15,
  '--transition': 'var(---,all 150ms)',

  '--hover_background-color': 'var(--color_slate-700)',
  '--hover_color': 'var(---,white)',
  '--hover_animation': 'var(--anim_wiggle)',
  '--{&:focus:hover}_background-color': 'var(---, red)',
  '--color-opacity': 'var(--alpha_30)',
  '--md_color-opacity': 'var(--alpha_80)',
  '--hover_color-opacity': 'var(--alpha_100)',

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
