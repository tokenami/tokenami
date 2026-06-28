import * as React from 'react';
import { css, type TokenamiStyle } from '../css';
import { Slot } from '@radix-ui/react-slot';

/* -------------------------------------------------------------------------------------------------
 * SelectableList
 * -----------------------------------------------------------------------------------------------*/

export interface SelectableListProps extends TokenamiStyle<React.ComponentProps<'ol'>> {}

function SelectableList(props: SelectableListProps) {
  const [cn, css] = selectableList();
  return <ol {...props} className={cn(props.className)} style={css(props.style)} />;
}

/* -------------------------------------------------------------------------------------------------
 * SelectableListItem
 * -----------------------------------------------------------------------------------------------*/

export interface SelectableListItemProps extends TokenamiStyle<React.ComponentProps<'li'>> {
  isSelected?: boolean;
}

function SelectableListItem({ isSelected, ...props }: SelectableListItemProps) {
  const [cn, css] = selectableListItem();
  return (
    <li
      {...props}
      className={cn('group', props.className)}
      style={css(props.style)}
      data-selected={isSelected ? '' : undefined}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * SelectableListTrigger
 * -----------------------------------------------------------------------------------------------*/

export interface SelectableListTriggerProps extends TokenamiStyle<React.ComponentProps<'button'>> {
  asChild?: boolean;
}

function SelectableListTrigger({ asChild = false, ...props }: SelectableListTriggerProps) {
  const [cn, css] = selectableListTrigger();
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} className={cn(props.className)} style={css(props.style)} />;
}

/* ---------------------------------------------------------------------------------------------- */

const selectableList = css.compose({
  '--display': 'grid',
  '--gap': 1,
});

const selectableListItem = css.compose({
  '--position': 'relative',
  '--isolation': 'isolate',
  '--overflow': 'hidden',
  '--border-radius': 'var(--radii_md)',
  '--hover-within_background-color': 'var(--color_gray3)',
  '--{&[data-selected]}_background-color': 'var(--color_gray4)',
  '--p': 2,
});

const selectableListTrigger = css.compose({
  '--transition': 'var(--morph_colors)',
  '--position': 'absolute',
  '--inset': 0,
  '--z-index': 1,
});

export {
  SelectableList,
  SelectableListItem,
  SelectableListTrigger,
  //
  SelectableList as Root,
  SelectableListItem as Item,
  SelectableListTrigger as Trigger,
};
