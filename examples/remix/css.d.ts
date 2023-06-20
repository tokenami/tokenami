declare module 'csstype' {
  interface Properties {
    // Allow CSS Custom Properties
    [index: `--${string}`]: any;
  }
}
