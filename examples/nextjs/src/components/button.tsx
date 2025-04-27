import * as React from 'react';
import { type Variants, type TokenamiStyle, css } from '@/css';
import { Icon } from './icon';

/* -------------------------------------------------------------------------------------------------
 * Button
 * -----------------------------------------------------------------------------------------------*/

interface ButtonProps
  extends TokenamiStyle<React.ComponentProps<'button'>>,
    Variants<typeof button> {}

const Button = (props: ButtonProps) => {
  const [cn, css] = button();
  return <button {...props} className={cn(props.className)} style={css(props.style)} />;
};

Button.displayName = 'Button';

/* -------------------------------------------------------------------------------------------------
 * ButtonIcon
 * -----------------------------------------------------------------------------------------------*/

interface ButtonIconProps
  extends TokenamiStyle<React.ComponentProps<typeof Icon>>,
    Variants<typeof buttonIcon> {}

const ButtonIcon = (props: ButtonIconProps) => {
  const [cn, css] = buttonIcon();
  return <Icon size="md" {...props} className={cn(props.className)} style={css(props.style)} />;
};

/* ---------------------------------------------------------------------------------------------- */

const button = css.compose({
  '--white-space': 'nowrap',
  '--display': 'flex',
  '--align-items': 'center',
  '--justify-content': 'center',
  '--gap': 0.5,
  '--py': 1,
  '--px': 3,
  '--border-radius': 'var(--radii_full)',
  '--background-color': 'var(--color_gray5)',
  '--color': 'var(--color_gray12)',
  '--transition': 'var(--morph_colors)',
  '--hover_background-color': 'var(--color_gray6)',
  '--hover_color': 'var(--color_gray12)',
  '--font': 'var(--text_sm)',
});

const buttonIcon = css.compose({
  '--color': 'var(--color_gray11)',
  '--ml': -1,
});

export {
  Button,
  ButtonIcon,
  //
  Button as Root,
  ButtonIcon as Icon,
};
