import { withDefaultConfig } from '../../.storylite/with-default-config';
import { css } from '../css';
import * as TitleCard from './title-card';

const story = withDefaultConfig<typeof CardSet>({
  title: 'TitleCard',
  component: CardSet,
});

export const DefaultStory: typeof story = {
  name: 'TitleCard',
};

function CardSet() {
  return (
    <div style={css({ '--display': 'grid', '--gap': 3, '--width': 90 })}>
      <TitleCard.Root>
        <TitleCard.Graphic color="crimson" />
        <TitleCard.Title>Flip</TitleCard.Title>
        <TitleCard.Description>Glass Animals</TitleCard.Description>
      </TitleCard.Root>
      <TitleCard.Root>
        <TitleCard.Graphic color="orange" />
        <TitleCard.Title>Golden hour</TitleCard.Title>
        <TitleCard.Description>Playlist · 38 songs</TitleCard.Description>
      </TitleCard.Root>
    </div>
  );
}

/* ---------------------------------------------------------------------------------------------- */

export default story;
