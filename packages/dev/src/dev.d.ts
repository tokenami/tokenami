import 'csstype';

declare module 'csstype' {
  interface Properties {
    // Allow all CSS Custom Properties
    [index: `--${string}`]: string | number;
  }
}
