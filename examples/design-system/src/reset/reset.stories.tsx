import { withDefaultConfig } from '../../.storylite/with-default-config';
import { Reset } from './reset';

const story = withDefaultConfig<typeof Reset>({
  title: 'Reset',
  component: Reset,
});

export const DefaultStory: typeof story = {
  name: 'Reset',
  args: {
    children: <p>Boop</p>,
  },
};

/* ---------------------------------------------------------------------------------------------- */

export default story;
