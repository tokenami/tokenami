import * as Remix from '@remix-run/react';
import * as RemixNode from '@remix-run/node';
import * as DS from '@tokenami/example-design-system';
import { css } from '~/css';
import styles from '~/../public/tokenami.css';

export const links: RemixNode.LinksFunction = () => [{ rel: 'stylesheet', href: styles }];

export default function App() {
  return (
    <html lang="en" style={css({ '--height': 'var(--size_fill)' })}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Remix.Meta />
        <Remix.Links />
      </head>
      <body
        className="theme-dark"
        style={css({ '--display': 'flex', '--height': 'var(--size_screen-h)' })}
      >
        <DS.Wallpaper
          style={css({
            '--display': 'flex',
            '--align-items': 'center',
            '--justify-content': 'center',
          })}
        >
          <Remix.Outlet />
        </DS.Wallpaper>
        <DS.Wallpaper
          className="theme-light"
          style={css({
            '--display': 'flex',
            '--align-items': 'center',
            '--justify-content': 'center',
          })}
        >
          <Remix.Outlet />
        </DS.Wallpaper>
        <Remix.ScrollRestoration />
        <Remix.Scripts />
        <Remix.LiveReload />
      </body>
    </html>
  );
}
