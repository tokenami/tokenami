import * as React from 'react';
import { Icon } from './icon';
import { css, type TokenamiStyle, type Variants } from '@/css';
import * as cssUtil from '@/css/utils';

/* -------------------------------------------------------------------------------------------------
 * IconButton
 * -----------------------------------------------------------------------------------------------*/

interface IconButtonProps
  extends TokenamiStyle<React.ComponentProps<'button'>>,
    Variants<typeof iconButton> {
  icon: React.ComponentProps<typeof Icon>['name'];
  children: React.ReactNode;
}

function IconButton({ size, icon, ...props }: IconButtonProps) {
  const [cn, css] = iconButton({ size });
  return (
    <button type="button" {...props} className={cn(props.className)} style={css(props.style)}>
      <Icon name={icon} size={size} />
      <span className={cssUtil.srOnly()}>{props.children}</span>
    </button>
  );
}

/* ---------------------------------------------------------------------------------------------- */

const iconButton = css.compose({
  '--display': 'flex',
  '--align-items': 'center',
  '--justify-content': 'center',
  '--border-radius': 'var(--radii_full)',
  '--background-color': 'var(--color_gray2)',
  '--color': 'var(--color_gray11)',
  '--transition': 'var(--morph_colors)',
  '--size': 7,

  '--hover_background-color': 'var(--color_gray5)',
  '--hover_color': 'var(--color_gray12)',

  variants: {
    size: {
      sm: { '--size': 6 },
      md: { '--size': 8 },
      lg: { '--size': 9 },
      xl: { '--size': 10 },
      '2xl': { '--size': 14 },
    },
  },
});

export { IconButton };
