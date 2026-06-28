import { withDefaultConfig } from '../../.storylite/with-default-config';
import * as ButtonGroup from './button-group';

const story = withDefaultConfig<typeof GroupExample>({
  title: 'ButtonGroup',
  component: GroupExample,
});

export const DefaultStory: typeof story = {
  name: 'ButtonGroup',
};

function GroupExample() {
  return (
    <ButtonGroup.Root>
      <ButtonGroup.Button>Playlists</ButtonGroup.Button>
      <ButtonGroup.Button>Podcasts</ButtonGroup.Button>
      <ButtonGroup.Button>Artists</ButtonGroup.Button>
      <ButtonGroup.Button>
        <ButtonGroup.Icon name="archive-stack-line" />
        Albums
      </ButtonGroup.Button>
    </ButtonGroup.Root>
  );
}

/* ---------------------------------------------------------------------------------------------- */

export default story;
