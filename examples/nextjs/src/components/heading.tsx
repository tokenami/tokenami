import * as React from 'react';
import { type Variants, type TokenamiStyle, css } from '@/css';

/* -------------------------------------------------------------------------------------------------
 * Heading
 * -----------------------------------------------------------------------------------------------*/

interface HeadingProps extends TokenamiStyle<React.ComponentProps<'h1'>>, Variants<typeof heading> {
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

const Heading = ({ level = 2, variant = level, ...props }: HeadingProps) => {
  const [cn, css] = heading({ variant });
  const Comp = `h${level}` as const;
  return <Comp {...props} className={cn(props.className)} style={css(props.style)} />;
};

Heading.displayName = 'Heading';

/* ---------------------------------------------------------------------------------------------- */

const heading = css.compose({
  '--color': 'var(--color_gray12)',

  variants: {
    variant: {
      1: { '--font': 'var(--text_3xl)', '--font-weight': 'var(--weight_bold)' },
      2: { '--font': 'var(--text_2xl)', '--font-weight': 'var(--weight_normal)' },
      3: { '--font': 'var(--text_xl)', '--font-weight': 'var(--weight_normal)' },
      4: { '--font': 'var(--text_lg)', '--font-weight': 'var(--weight_normal)' },
      5: { '--font': 'var(--text_base)', '--font-weight': 'var(--weight_light)' },
      6: { '--font': 'var(--text_sm)', '--font-weight': 'var(--weight_light)' },
    },
  },
});

export { Heading };
