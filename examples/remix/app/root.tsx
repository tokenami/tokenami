import * as React from 'react';
import * as Remix from '@remix-run/react';
import * as DS from '@tokenami/example-design-system';
import { css } from '~/css';

export const links = () => [{ rel: 'stylesheet', href: '/tokenami.css' }];
export default function App() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  return (
    <html lang="en" style={css({ '--height': 'var(--size_full)' })}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Remix.Meta />
        <Remix.Links />
      </head>
      <body
        data-theme={theme}
        style={css({
          '--min-height': 'var(--size_full)',
          '---radial-gradient': 'radial-gradient(circle, #000000 1px, rgba(0, 0, 0, 0) 1px)',
          '---grid-bg-size': 'calc(var(--_grid) * 5)',
          '--background-size': 'var(---,var(---grid-bg-size) var(---grid-bg-size))',
          '--background-image': 'var(---,var(---radial-gradient))',
          '--background-color': 'var(--color_indigo6)',
          '--background-position-x': 1,
          '--background-position-y': 0.5,
          '--display': 'flex',
          '--flex-direction': 'column',
          '--align-items': 'center',
          '--justify-content': 'center',
          '--child-p_background-color': 'var(--color_indigo5)',
          '--child-p_border-radius': 'var(--radii_sm)',
          '--child-p_px': 2,
        })}
      >
        <DS.Button onClick={() => setTheme((theme) => (theme === 'light' ? 'dark' : 'light'))}>
          Switch theme
        </DS.Button>
        <Remix.Outlet />
        <Remix.ScrollRestoration />
        <Remix.Scripts />
      </body>
    </html>
  );
}
