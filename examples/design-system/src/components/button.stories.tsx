import { withDefaultConfig } from '../../.storylite/with-default-config';
import * as Button from './button';

const story = withDefaultConfig<typeof Button.Root>({
  title: 'Button',
  component: Button.Root,
});

export const DefaultStory: typeof story = {
  name: 'Default',
  args: {
    children: 'Playlists',
  },
};

export const WithIconStory: typeof story = {
  name: 'With icon',
  args: {
    children: (
      <>
        <Button.Icon name="play-fill" />
        Play now
      </>
    ),
  },
};

/* ---------------------------------------------------------------------------------------------- */

export default story;
