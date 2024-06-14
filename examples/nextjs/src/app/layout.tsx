import type { Metadata } from 'next';
import * as React from 'react';
import * as DS from '@tokenami/example-design-system';
import { css } from '@/css';
import './tokenami.css';

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

// @ts-ignore
globalThis[Symbol.for('@tokenami/css')] = {
  escapeSpecialChars: true,
};

export default function RootLayout({ children }: Readonly<React.PropsWithChildren>) {
  return (
    <html lang="en">
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
          {children}
        </DS.Wallpaper>
        <DS.Wallpaper
          className="theme-light"
          style={css({
            '--display': 'flex',
            '--align-items': 'center',
            '--justify-content': 'center',
          })}
        >
          {children}
        </DS.Wallpaper>
      </body>
    </html>
  );
}
