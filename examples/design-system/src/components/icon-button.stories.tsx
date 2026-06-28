import { withDefaultConfig } from '../../.storylite/with-default-config';
import { css } from '../css';
import { IconButton } from './icon-button';

const story = withDefaultConfig<typeof IconButtonSet>({
  title: 'IconButton',
  component: IconButtonSet,
});

export const DefaultStory: typeof story = {
  name: 'IconButton',
};

function IconButtonSet() {
  return (
    <div style={css({ '--display': 'flex', '--align-items': 'center', '--gap': 2 })}>
      <IconButton icon="shuffle-line" size="sm">
        Shuffle
      </IconButton>
      <IconButton icon="play-fill" size="md">
        Play
      </IconButton>
      <IconButton icon="skip-forward-fill" size="lg">
        Next
      </IconButton>
      <IconButton icon="volume-up-line" size="xl">
        Volume
      </IconButton>
    </div>
  );
}

/* ---------------------------------------------------------------------------------------------- */

export default story;
