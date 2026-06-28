import { css } from './css';

const [srOnly] = css.compose({
  '--position': 'absolute',
  '--size': 'var(--size_px)',
  '--margin': 'var(---, -1px)',
  '--overflow': 'hidden',
  '--clip': 'rect(0, 0, 0, 0)',
  '--white-space': 'nowrap',
  '--border-width': 'var(--line-size_0)',
  '--p': 0,
})();

export { srOnly };
