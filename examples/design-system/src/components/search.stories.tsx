import { withDefaultConfig } from '../../.storylite/with-default-config';
import { Search } from './search';

const story = withDefaultConfig<typeof Search>({
  title: 'Search',
  component: Search,
});

export const DefaultStory: typeof story = {
  name: 'Default',
  args: {
    'aria-label': 'Search library',
  },
};

export const WithValueStory: typeof story = {
  name: 'With value',
  args: {
    'aria-label': 'Search library',
    defaultValue: 'Dream pop',
  },
};

/* ---------------------------------------------------------------------------------------------- */

export default story;
