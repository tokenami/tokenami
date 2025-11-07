import * as React from 'react';
import { type IconName } from './icons/name';
import spriteHref from './icons/sprite.svg';
import { type TokenamiStyle, css, type Variants } from '@/css';

/* -------------------------------------------------------------------------------------------------
 * Icon
 * -----------------------------------------------------------------------------------------------*/

interface IconProps extends TokenamiStyle<React.ComponentProps<'svg'>>, Variants<typeof icon> {
  name: IconName;
}

const Icon = ({ name, size, ...props }: IconProps) => {
  const [cn, css] = icon({ size });
  const href = typeof spriteHref === 'string' ? spriteHref : spriteHref.src;
  return (
    <svg {...props} className={cn(props.className)} style={css(props.style)}>
      <use href={`${href}#${name}`} />
    </svg>
  );
};

Icon.displayName = 'Icon';

/* ---------------------------------------------------------------------------------------------- */

const icon = css.compose({
  '--size': 4,
  '--color': 'var(--color_current)',

  variants: {
    size: {
      sm: { '--size': 3 },
      md: { '--size': 4 },
      lg: { '--size': 5 },
      xl: { '--size': 6 },
      '2xl': { '--size': 7 },
    },
  },
});

export { Icon };
