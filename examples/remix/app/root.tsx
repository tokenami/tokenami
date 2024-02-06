import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import { css } from '~/css';

export default function App() {
  return (
    <html lang="en" style={css({ '--height': 'var(--size_fill)' })}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body style={css({ '--min-height': 'var(--size_fill)', '--m': 0, '--p': 0 })}>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
