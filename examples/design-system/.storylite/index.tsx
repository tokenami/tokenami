import '@storylite/storylite/styles.css';

// import other StoryLite UI styles here

import { renderStoryLiteApp, useStoryLiteStore } from '@storylite/storylite';
import stories from '@storylite/vite-plugin:stories';

import config from './config';

const rootElement = document.getElementById('root') as HTMLElement;

useStoryLiteStore.getState().initialize(config, stories);
renderStoryLiteApp(rootElement, stories, config);
