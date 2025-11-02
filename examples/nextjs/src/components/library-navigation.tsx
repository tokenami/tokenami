'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as SelectableList from '@/components/selectable-list';

/* -------------------------------------------------------------------------------------------------
 * LibraryNavigation
 * -----------------------------------------------------------------------------------------------*/

interface LibraryNavigationContextValue {
  pathname: string;
}

const LibraryNavigationContext = React.createContext<LibraryNavigationContextValue | null>(null);
const useLibraryNavigationContext = () => {
  const context = React.useContext(LibraryNavigationContext);
  if (!context) throw new Error('LibraryNavigation parts must be used within LibraryNavigation');
  return context;
};

type SelectableListProps = React.ComponentProps<typeof SelectableList.Root>;
interface LibraryNavigationProps extends SelectableListProps {}

const LibraryNavigation = (props: LibraryNavigationProps) => {
  const pathname = usePathname();

  return (
    <LibraryNavigationContext.Provider value={React.useMemo(() => ({ pathname }), [pathname])}>
      <SelectableList.Root {...props} />
    </LibraryNavigationContext.Provider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * LibraryNavigationItem
 * -----------------------------------------------------------------------------------------------*/

interface SelectableListItemProps extends React.ComponentProps<typeof SelectableList.Item> {}
interface LibraryNavigationItemProps extends SelectableListItemProps {
  href: string;
}

const LibraryNavigationItem = (props: LibraryNavigationItemProps) => {
  const context = useLibraryNavigationContext();
  const isSelected = context.pathname === props.href;

  return (
    <SelectableList.Item isSelected={isSelected} {...props}>
      <SelectableList.Trigger asChild>
        <Link href={props.href} aria-current={isSelected ? 'page' : undefined} />
      </SelectableList.Trigger>
      {props.children}
    </SelectableList.Item>
  );
};

/* ---------------------------------------------------------------------------------------------- */

export { LibraryNavigation as Root, LibraryNavigationItem as Item };
