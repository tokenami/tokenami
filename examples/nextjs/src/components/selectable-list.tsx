import * as React from 'react';
import { css, type TokenamiStyle } from '@/css';
import { Slot } from './slot';

/* -------------------------------------------------------------------------------------------------
 * SelectableList
 * -----------------------------------------------------------------------------------------------*/

interface SelectableListProps extends TokenamiStyle<React.ComponentProps<'ol'>> {}

const SelectableList = (props: SelectableListProps) => {
  const [cn, css] = selectableList();
  return <ol {...props} className={cn(props.className)} style={css(props.style)} />;
};

SelectableList.displayName = 'SelectableList';

/* -------------------------------------------------------------------------------------------------
 * SelectableListItem
 * -----------------------------------------------------------------------------------------------*/

interface SelectableListItemProps extends TokenamiStyle<React.ComponentProps<'li'>> {
  isSelected?: boolean;
}

const SelectableListItem = ({ isSelected, ...props }: SelectableListItemProps) => {
  const [cn, css] = selectableListItem();
  return (
    <li
      {...props}
      className={cn('group', props.className)}
      style={css(props.style)}
      data-selected={isSelected ? '' : undefined}
    />
  );
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
