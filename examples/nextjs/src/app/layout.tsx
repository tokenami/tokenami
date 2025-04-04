import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import { css } from '@/css';
import { Icon } from '@/components/icon';
import { IconButton } from '@/components/icon-button';
import { Heading } from '@/components/heading';
import { Frame } from '@/components/frame';
import { Search } from '@/components/search';
import * as mockLibrary from '@/mock/library';
import * as SelectableList from '@/components/selectable-list';
import * as TitleCard from '@/components/title-card';
import * as Button from '@/components/button';
import * as cssUtil from '@/css/utils';

import './tokenami.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={css({
          '--dark_background-color': 'var(--color_black)',
          '--light_background-color': 'var(--color_white)',
          '--height': 'var(--size_screen-h)',
          '--display': 'flex',
          '--flex-direction': 'column',
          '--color': 'var(--color_gray12)',
          '--font-weight': 'var(--weight_extralight)',
          '--gap': 1.5,
          '--p': 1.5,
        })}
      >
        <header
          style={css({
            '--display': 'flex',
            '--align-items': 'center',
            '--justify-content': 'center',
          })}
        >
          <div
            style={css({
              '--display': 'flex',
              '--align-items': 'center',
              '--justify-content': 'center',
              '--gap': 1,
            })}
          >
            <IconButton icon="home-5-line" size="xl">
              Home
            </IconButton>
            <Search />
          </div>
        </header>

        <div
          style={css({
            '--flex': 'var(--flex_auto)',
            '--display': 'flex',
            '--min-height': 0,
            '--gap': 1.5,
          })}
        >
          <Frame
            asChild
            style={{
              '--width': 'var(--fluid-width-clamp_min-max)',
              '--fluid-width-min': 67,
              '--fluid-width-max': 86,
            }}
          >
            <aside>
              <header
                style={css({
                  '--p': 2,
                  '--display': 'flex',
                  '--flex-direction': 'column',
                  '--gap': 4,
                })}
              >
                <div
                  style={css({
                    '--display': 'flex',
                    '--align-items': 'center',
                    '--justify-content': 'space-between',
                    '--gap': 1,
                  })}
                >
                  <Heading
                    level={2}
                    variant={4}
                    style={{ '--display': 'flex', '--align-items': 'center', '--gap': 1 }}
                  >
                    <Icon name="archive-stack-line" size="lg" />
                    Your Library
                  </Heading>

                  <Button.Root>
                    <Button.Icon name="add-line" />
                    Create
                  </Button.Root>
                </div>

                <div style={css({ '--display': 'flex', '--gap': 1.5, '--overflow-x': 'auto' })}>
                  <Button.Root>Playlists</Button.Root>
                  <Button.Root>Podcasts</Button.Root>
                  <Button.Root>Artists</Button.Root>
                  <Button.Root>Albums</Button.Root>
                </div>

                <div
                  style={css({
                    '--display': 'flex',
                    '--gap': 1,
                    '--overflow-x': 'auto',
                    '--align-items': 'center',
                    '--justify-content': 'space-between',
                    '--font': 'var(--text_sm)',
                  })}
                >
                  <IconButton icon="search-line" size="md">
                    Search
                  </IconButton>{' '}
                  Recents
                </div>
              </header>

              <SelectableList.Root>
                {mockLibrary.list.map((item) => (
                  <SelectableList.Item key={item.id}>
                    <SelectableList.Trigger asChild>
                      <Link href={`/library/${item.id}`} />
                    </SelectableList.Trigger>
                    <LibraryCard
                      title={item.title}
                      type={item.type}
                      author={item.author}
                      color={item.color}
                    />
                  </SelectableList.Item>
                ))}
              </SelectableList.Root>
            </aside>
          </Frame>

          {children}
        </div>

        <footer style={css({ '--px': 4, '--py': 2 })}>
          <TitleCard.Root>
            <TitleCard.Graphic color="var(--color_crimson9)" />
            <TitleCard.Content>
              <TitleCard.Title variant={6}>Flip</TitleCard.Title>
              <TitleCard.Description style={{ '--font': 'var(--text_xs)' }}>
                Glass Animals
              </TitleCard.Description>
            </TitleCard.Content>
          </TitleCard.Root>
        </footer>
      </body>
    </html>
  );
}

/* -------------------------------------------------------------------------------------------------
 * LibraryCard
 * -----------------------------------------------------------------------------------------------*/

interface LibraryCardProps {
  title: string;
  type: string;
  author: string;
  color?: React.ComponentProps<typeof TitleCard.Graphic>['color'];
}

const LibraryCard = ({ title, type, author, color }: LibraryCardProps) => {
  return (
    <TitleCard.Root>
      <TitleCard.Graphic
        color={color}
        style={{ '--box-shadow': 'var(--shadow_base)', '--shadow-color': 'var(--color_blackA6)' }}
      />
      <TitleCard.Content>
        <TitleCard.Title level={3} variant={5}>
          {title}
        </TitleCard.Title>
        <TitleCard.Description asChild>
          <dl>
            <dt style={cssUtil.srOnly}>Type</dt>
            <dd>{type}</dd>
            <dt style={cssUtil.srOnly}>Author</dt>
            <dd>{author}</dd>
          </dl>
        </TitleCard.Description>
      </TitleCard.Content>
    </TitleCard.Root>
  );
};
