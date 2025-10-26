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

interface TitleCardGraphicProps extends React.ComponentProps<typeof Cover> {}

const TitleCardGraphic = (props: TitleCardGraphicProps) => {
  const [cn, css] = titleCardGraphic();
  return <Cover {...props} className={cn(props.className)} style={css(props.style)} />;
};

TitleCardGraphic.displayName = 'TitleCardGraphic';

/* -------------------------------------------------------------------------------------------------
 * TitleCardTitle
 * -----------------------------------------------------------------------------------------------*/

type HeadingProps = React.ComponentProps<typeof Heading>;
interface TitleCardTitleProps extends Omit<HeadingProps, 'level'> {
  level?: HeadingProps['level'];
}

const TitleCardTitle = (props: TitleCardTitleProps) => {
  const [cn, css] = titleCardTitle();
  return (
    <Heading
      level={3}
      variant={5}
      {...props}
      className={cn(props.className)}
      style={css(props.style)}
    />
  );
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
  '--display': 'grid',
  '--grid-template-areas': "'graphic title' 'graphic description'",
  '--grid-template-columns': 'var(---, auto 1fr)',
  '--grid-template-rows': 'var(---, auto auto)',
  '--gap-x': 3,
});

const titleCardGraphic = css.compose({
  '--grid-area': 'var(---, graphic)',
});

const titleCardTitle = css.compose({
  '--grid-area': 'var(---, title)',
});

const titleCardDescription = css.compose({
  '--font': 'var(--text_xs)',
  '--color': 'var(--color_gray11)',
  '--grid-area': 'var(---, description)',
});

export {
  TitleCard,
  TitleCardGraphic,
  TitleCardTitle,
  TitleCardDescription,
  //
  TitleCard as Root,
  TitleCardGraphic as Graphic,
  TitleCardTitle as Title,
  TitleCardDescription as Description,
};
