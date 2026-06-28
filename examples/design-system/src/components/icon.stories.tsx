import { withDefaultConfig } from '../../.storylite/with-default-config';
import { css } from '../css';
import { Icon } from './icon';

const story = withDefaultConfig<typeof IconSet>({
  title: 'Icon',
  component: IconSet,
});

export const DefaultStory: typeof story = {
  name: 'Icon',
};

function IconSet() {
  return (
    <div
      style={css({
        '--display': 'flex',
        '--align-items': 'center',
        '--gap': 4,
        '--color': 'var(--color_gray12)',
      })}
    >
      <Icon name="home-5-line" size="sm" role="presentation" />
      <Icon name="search-line" size="md" role="presentation" />
      <Icon name="play-fill" size="lg" role="presentation" />
      <Icon name="archive-stack-line" size="xl" role="presentation" />
      <Icon name="volume-up-line" size="2xl" role="presentation" />
    </div>
  );
}

/* ---------------------------------------------------------------------------------------------- */

export default story;
