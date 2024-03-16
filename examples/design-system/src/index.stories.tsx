import { withDefaultConfig } from '../.storylite/with-default-config';

export default withDefaultConfig({
  title: 'Welcome',
  navigation: {
    icon: <span>🏠</span>,
    order: 0,
    hidden: false,
  },
  component: () => <div>Welcome to the example Tokenami design system.</div>,
});
