import '@storylite/storylite/styles.css';
import './styles/storylite-iframe.css';
import './styles/storylite-ui.css';

// import iframe-scope styles here

import { renderStoryLiteApp } from '@storylite/storylite';
import stories from '@storylite/vite-plugin:stories';
import '../src/tokenami.css';

import config from './config';

const rootElement = document.getElementById('root') as HTMLElement;

renderStoryLiteApp(rootElement, stories, config);
