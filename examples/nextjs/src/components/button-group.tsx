import * as React from 'react';
import * as Button from '@/components/button';
import { css, type TokenamiStyle } from '@/css';

/* -------------------------------------------------------------------------------------------------
 * ButtonGroup
 * -----------------------------------------------------------------------------------------------*/

const ButtonGroup = (props: TokenamiStyle<React.ComponentProps<'div'>>) => {
  const [cn, css] = buttonGroup();
  return <div {...props} className={cn(props.className)} style={css(props.style)} />;
};

const buttonGroup = css.compose({
  '--display': 'flex',
  '--gap': 1.5,
  '--overflow-x': 'auto',
  '--scrollbar-display': 'none',
  '--webkit-scrollbar_display': 'none',
  '--min-width': 0,
});

/* ---------------------------------------------------------------------------------------------- */

const ButtonGroupButton = Button.Root;
const ButtonGroupIcon = Button.Icon;

export { ButtonGroup as Root, ButtonGroupButton as Button, ButtonGroupIcon as Icon };
