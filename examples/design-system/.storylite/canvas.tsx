import '@storylite/storylite/styles.css';
import './styles/storylite-iframe.css';
import '../src/tokenami.css';
import '../src/font.css';

// import iframe-scope styles here

import { renderStoryLiteApp, useStoryLiteStore } from '@storylite/storylite';
import stories from '@storylite/vite-plugin:stories';

import config from './config';

const rootElement = document.getElementById('root') as HTMLElement;

useStoryLiteStore.getState().initialize(config, stories);
renderStoryLiteApp(rootElement, stories, config);
