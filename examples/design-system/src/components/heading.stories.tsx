import { withDefaultConfig } from '../../.storylite/with-default-config';
import { css } from '../css';
import { Heading } from './heading';

const story = withDefaultConfig<typeof HeadingSet>({
  title: 'Heading',
  component: HeadingSet,
});

export const DefaultStory: typeof story = {
  name: 'Heading',
};

function HeadingSet() {
  return (
    <div style={css({ '--display': 'grid', '--gap': 2 })}>
      <Heading level={1}>Recently played</Heading>
      <Heading level={2}>Made for you</Heading>
      <Heading level={3}>Album details</Heading>
      <Heading level={4}>Popular tracks</Heading>
      <Heading level={5}>Track title</Heading>
      <Heading level={6}>Track metadata</Heading>
    </div>
  );
}

/* ---------------------------------------------------------------------------------------------- */

export default story;
