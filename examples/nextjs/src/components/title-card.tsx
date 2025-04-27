import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { TokenamiProperties, css, type TokenamiStyle } from '@/css';
import { Heading } from './heading';
import { Cover } from './cover';

/* -------------------------------------------------------------------------------------------------
 * TitleCard
 * -----------------------------------------------------------------------------------------------*/

interface TitleCardProps extends TokenamiStyle<React.ComponentProps<'div'>> {
  asChild?: boolean;
}

const TitleCard = ({ asChild = false, ...props }: TitleCardProps) => {
  const Comp = asChild ? Slot : 'div';
  const [cn, css] = titleCard();
  return <Comp {...props} className={cn(props.className)} style={css(props.style)} />;
};

TitleCard.displayName = 'TitleCard';

/* -------------------------------------------------------------------------------------------------
 * TitleCardGraphic
 * -----------------------------------------------------------------------------------------------*/

const TitleCardGraphic = Cover;

/* -------------------------------------------------------------------------------------------------
 * TitleCardContent
 * -----------------------------------------------------------------------------------------------*/

interface TitleCardContentProps extends React.ComponentProps<'div'> {}

const TitleCardContent = (props: TitleCardContentProps) => {
  return <div {...props} />;
};

TitleCardContent.displayName = 'TitleCardContent';

/* -------------------------------------------------------------------------------------------------
 * TitleCardTitle
 * -----------------------------------------------------------------------------------------------*/

type HeadingProps = React.ComponentProps<typeof Heading>;
interface TitleCardTitleProps extends Omit<HeadingProps, 'level'> {
  level?: HeadingProps['level'];
}

const TitleCardTitle = (props: TitleCardTitleProps) => {
  return <Heading level={3} variant={5} {...props} />;
};

TitleCardTitle.displayName = 'TitleCardTitle';

/* -------------------------------------------------------------------------------------------------
 * TitleCardDescription
 * -----------------------------------------------------------------------------------------------*/

interface TitleCardDescriptionProps extends TokenamiStyle<React.ComponentProps<'p'>> {
  asChild?: boolean;
}

const TitleCardDescription = ({ asChild = false, ...props }: TitleCardDescriptionProps) => {
  const Comp = asChild ? Slot : 'p';
  const [cn, css] = titleCardDescription();
  return <Comp {...props} className={cn(props.className)} style={css(props.style)} />;
};

TitleCardDescription.displayName = 'TitleCardDescription';

/* ---------------------------------------------------------------------------------------------- */

const titleCard = css.compose({
  '--display': 'flex',
  '--gap': 3,
  '--align-items': 'center',
});

const titleCardDescription = css.compose({
  '--display': 'flex',
  '--gap': 1,
  '--font': 'var(--text_xs)',
  '--color': 'var(--color_gray11)',
});

export {
  TitleCard,
  TitleCardGraphic,
  TitleCardContent,
  TitleCardTitle,
  TitleCardDescription,
  //
  TitleCard as Root,
  TitleCardGraphic as Graphic,
  TitleCardContent as Content,
  TitleCardTitle as Title,
  TitleCardDescription as Description,
};
