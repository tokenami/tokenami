import { withDefaultConfig } from '../.storylite/with-default-config';
import { css } from './css';

export default withDefaultConfig({
  title: 'Welcome',
  navigation: {
    icon: <span>🏠</span>,
    order: 0,
    hidden: false,
  },
  component: () => (
    <div
      style={css({ '--dark_color': 'var(--color_white)', '--light_color': 'var(--color_black)' })}
    >
      Welcome to the example Tokenami design system.
    </div>
  ),
});
