import * as React from 'react';
import { type Variants, type TokenamiStyle, css } from '~/css';

/* -------------------------------------------------------------------------------------------------
 * Button
 * -----------------------------------------------------------------------------------------------*/

type ButtonElement = React.ElementRef<'button'>;
type ButtonElementProps = React.ComponentPropsWithoutRef<'button'>;
interface ButtonProps extends TokenamiStyle<ButtonElementProps>, Variants<typeof button> {}

const Button = React.forwardRef<ButtonElement, ButtonProps>((props, forwardedRef) => {
  const { size = 'small', ...buttonProps } = props;
  return (
    <button
      type="button"
      {...buttonProps}
      ref={forwardedRef}
      style={button({ size }, props.style)}
    />
  );
});

const button = css.compose({
  '---surface-from': 'var(--color_secondary-bright)',
  '---surface-to': 'var(--color_primary-bright)',
  '--background-image': 'var(--surface_radial-gradient-tl)',
  '--border-radius': 'var(--radii_sm)',
  '--background-size': 'var(---, 200% auto)',
  '--border': 'var(--border_none)',
  '--color': 'var(--color_on-surface)',
  '--transition': 'var(---, all 300ms ease-in-out)',
  '--box-shadow': 'var(--shadow_border)',
  '--py': 3,
  '--px': 8,

  '--hover_background-position': 'var(---, 99% bottom)',
  '--{&:focus:hover}_background-color': 'var(---, red)',

  responsiveVariants: {
    size: {
      small: {
        '--font-size': 'var(---,16px)',
      },
      large: {
        '--font-size': 'var(---,20px)',
      },
    },
  },
});

/* ---------------------------------------------------------------------------------------------- */

export { Button };
