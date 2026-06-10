import { log } from '@tokenami/node';
import { run } from './index';

try {
  run();
} catch (e) {
  log.error(e instanceof Error ? e.message : 'Unknown error occurred.');
}
