import { withDefaultConfig } from '../../.storylite/with-default-config';
import { css } from '../css';
import * as SelectableList from './selectable-list';
import * as TitleCard from './title-card';

const story = withDefaultConfig<typeof ListExample>({
  title: 'SelectableList',
  component: ListExample,
});

export const DefaultStory: typeof story = {
  name: 'SelectableList',
};

function ListExample() {
  return (
    <SelectableList.Root style={css({ '--width': 90 })}>
      <SelectableList.Item isSelected>
        <SelectableList.Trigger aria-label="Open Midnight Mix" />
        <TitleCard.Root>
          <TitleCard.Graphic color="iris" />
          <TitleCard.Title>Midnight Mix</TitleCard.Title>
          <TitleCard.Description>Playlist</TitleCard.Description>
        </TitleCard.Root>
      </SelectableList.Item>
      <SelectableList.Item>
        <SelectableList.Trigger aria-label="Open Soft Focus" />
        <TitleCard.Root>
          <TitleCard.Graphic color="sky" />
          <TitleCard.Title>Soft Focus</TitleCard.Title>
          <TitleCard.Description>Album</TitleCard.Description>
        </TitleCard.Root>
      </SelectableList.Item>
      <SelectableList.Item>
        <SelectableList.Trigger aria-label="Open Daily Rotation" />
        <TitleCard.Root>
          <TitleCard.Graphic color="green" />
          <TitleCard.Title>Daily Rotation</TitleCard.Title>
          <TitleCard.Description>Station</TitleCard.Description>
        </TitleCard.Root>
      </SelectableList.Item>
    </SelectableList.Root>
  );
}

/* ---------------------------------------------------------------------------------------------- */

export default story;
