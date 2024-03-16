import { withDefaultConfig } from '../../.storylite/with-default-config';
import { Button } from './button';

const story = withDefaultConfig<typeof Button>({
  title: 'Button',
  component: Button,
});

export const DefaultStory: typeof story = {
  name: 'Default',
  args: {
    children: 'Boop',
  },
};

export const LargeStory: typeof story = {
  args: {
    size: 'large',
    children: 'Boop',
  },
};

/* ---------------------------------------------------------------------------------------------- */

export default story;
