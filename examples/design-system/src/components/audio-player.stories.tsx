import { withDefaultConfig } from '../../.storylite/with-default-config';
import { css } from '../css';
import * as AudioPlayer from './audio-player';

const story = withDefaultConfig<typeof PlayerExample>({
  title: 'AudioPlayer',
  component: PlayerExample,
});

export const DefaultStory: typeof story = {
  name: 'AudioPlayer',
};

function PlayerExample() {
  return (
    <AudioPlayer.Root style={css({ '--max-width': 180 })}>
      <AudioPlayer.Player>
        <AudioPlayer.Controls />
        <AudioPlayer.Scrubber />
      </AudioPlayer.Player>
      <AudioPlayer.Volume />
    </AudioPlayer.Root>
  );
}

/* ---------------------------------------------------------------------------------------------- */

export default story;
