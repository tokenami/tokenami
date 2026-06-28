import { withDefaultConfig } from '../../.storylite/with-default-config';
import { css } from '../css';
import { Frame } from './frame';
import { Heading } from './heading';

const story = withDefaultConfig<typeof FrameExample>({
  title: 'Frame',
  component: FrameExample,
});

export const DefaultStory: typeof story = {
  name: 'Frame',
};

function FrameExample() {
  return (
    <Frame color="sky" style={css({ '--width': 120, '--height': 40 })}>
      <div
        style={css({
          '--display': 'grid',
          '--place-content': 'center',
          '--height': 'var(--size_full)',
        })}
      >
        <Heading level={3} variant={4}>
          Library frame
        </Heading>
      </div>
    </Frame>
  );
}

/* ---------------------------------------------------------------------------------------------- */

export default story;
