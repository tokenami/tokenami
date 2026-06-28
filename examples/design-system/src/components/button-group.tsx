import * as React from 'react';
import * as Button from './button';
import { css, type TokenamiStyle } from '../css';

/* -------------------------------------------------------------------------------------------------
 * ButtonGroup
 * -----------------------------------------------------------------------------------------------*/

function ButtonGroup(props: TokenamiStyle<React.ComponentProps<'div'>>) {
  const [cn, css] = buttonGroup();
  return <div {...props} className={cn(props.className)} style={css(props.style)} />;
}

const buttonGroup = css.compose({
  '--display': 'flex',
  '--gap': 1.5,
  '--overflow-x': 'auto',
  '--scrollbar-width': 'none',
  '--webkit-scrollbar_display': 'none',
  '--min-width': 0,
});

/* ---------------------------------------------------------------------------------------------- */

const ButtonGroupButton = Button.Root;
const ButtonGroupIcon = Button.Icon;

export { ButtonGroup as Root, ButtonGroupButton as Button, ButtonGroupIcon as Icon };
