import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import * as DS from '@tokenami/example-design-system';
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
      <DS.Reset asChild>
        <body className={'theme-light'} style={css({ '--min-height': 'var(--size_fill)' })}>
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </DS.Reset>
    </html>
  );
}
