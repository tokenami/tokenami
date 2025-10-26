import * as React from 'react';
import { css, type TokenamiStyle } from '@/css';
import { Slot } from '@radix-ui/react-slot';

/* -------------------------------------------------------------------------------------------------
 * SelectableList
 * -----------------------------------------------------------------------------------------------*/

interface SelectableListProps extends React.ComponentProps<'ol'> {}

const SelectableList = (props: SelectableListProps) => {
  return <ol {...props} />;
};

SelectableList.displayName = 'SelectableList';

/* -------------------------------------------------------------------------------------------------
 * SelectableListItem
 * -----------------------------------------------------------------------------------------------*/

interface SelectableListItemProps extends TokenamiStyle<React.ComponentProps<'li'>> {}

const SelectableListItem = (props: SelectableListItemProps) => {
  const [cn, css] = selectableListItem();
  return <li {...props} className={cn('group', props.className)} style={css(props.style)} />;
};

SelectableListItem.displayName = 'SelectableListItem';

/* -------------------------------------------------------------------------------------------------
 * SelectableListTrigger
 * -----------------------------------------------------------------------------------------------*/

interface SelectableListTriggerProps extends TokenamiStyle<React.ComponentProps<'button'>> {
  asChild?: boolean;
}

const SelectableListTrigger = ({ asChild = false, ...props }: SelectableListTriggerProps) => {
  const [cn, css] = selectableListTrigger();
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} className={cn(props.className)} style={css(props.style)} />;
};

SelectableListTrigger.displayName = 'SelectableListTrigger';

/* ---------------------------------------------------------------------------------------------- */

const selectableListItem = css.compose({
  '--position': 'relative',
  '--isolation': 'isolate',
  '--overflow': 'hidden',
  '--border-radius': 'var(--radii_md)',
  '--hover-within_background-color': 'var(--color_gray3)',
  '--p': 2,
});

const selectableListTrigger = css.compose({
  '--background-color': 'inherit',
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
