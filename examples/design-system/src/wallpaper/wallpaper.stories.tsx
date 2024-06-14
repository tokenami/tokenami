import { withDefaultConfig } from '../../.storylite/with-default-config';
import { Wallpaper } from './wallpaper';

const story = withDefaultConfig<typeof Wallpaper>({
  title: 'Button',
  component: Wallpaper,
});

export const DefaultStory: typeof story = {
  name: 'Default',
  args: {
    children: 'Boop',
  },
};

/* ---------------------------------------------------------------------------------------------- */

export default story;
