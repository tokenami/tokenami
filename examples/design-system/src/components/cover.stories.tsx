import { withDefaultConfig } from '../../.storylite/with-default-config';
import { css } from '../css';
import { Cover } from './cover';

const story = withDefaultConfig<typeof CoverSet>({
  title: 'Cover',
  component: CoverSet,
});

export const DefaultStory: typeof story = {
  name: 'Cover',
};

function CoverSet() {
  return (
    <div style={css({ '--display': 'flex', '--align-items': 'end', '--gap': 3 })}>
      <Cover color="green" size="sm" />
      <Cover color="sky" size="md" />
      <Cover color="orange" size="lg" />
      <Cover color="iris" size="xl" />
      <Cover color="crimson" size="2xl" />
    </div>
  );
}

/* ---------------------------------------------------------------------------------------------- */

export default story;
