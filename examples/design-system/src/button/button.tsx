import * as React from 'react';
import { type Variants, type TokenamiStyle, css } from '~/css';

/* -------------------------------------------------------------------------------------------------
 * Button
 * -----------------------------------------------------------------------------------------------*/

type ButtonElementProps = React.ComponentPropsWithoutRef<'button'>;
interface ButtonProps extends TokenamiStyle<ButtonElementProps>, Variants<typeof button> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, forwardedRef) => {
  const { size = 'small', children, ...buttonProps } = props;
  const [cn, css] = button({ size });
  return (
    <button
      type="button"
      {...buttonProps}
      ref={forwardedRef}
      className={cn(props.className)}
      style={css(props.style)}
    >
      {children}
    </button>
  );
});

const button = css.compose({
  '--bg': 'var(--color_violet9)',
  '--color': 'var(--color_white)',
  '--border-bottom': 'var(--line_px)',
  '--border-color': 'var(--color_violet11)',
  '--border-radius': 'var(--radii_lg)',
  '--width': 'var(---,180px)',
  '--height': 15,
  '--transition': 'var(--morph_all)',

  '--hover_background-color': 'var(--color_violet10)',
  '--hover_animation': 'var(--anim_wiggle)',
  '--{&:focus:hover}_background-color': 'var(---, red)',

  responsiveVariants: {
    size: {
      small: {
        '--font': 'var(--text_base)',
      },
      large: {
        '--font': 'var(--text_xl)',
        '--font-family': 'var(--font_mono)',
      },
    },
  },
});

/* ---------------------------------------------------------------------------------------------- */

export type { ButtonProps };
export { Button };
