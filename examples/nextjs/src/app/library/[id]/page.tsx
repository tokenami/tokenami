import { notFound } from 'next/navigation';
import { Frame } from '@/components/frame';
import * as mockLibrary from '@/mock/library';
import { Cover } from '@/components/cover';
import { css } from '@/css';
import { Heading } from '@/components/heading';
import { IconButton } from '@/components/icon-button';

export default async function LibraryItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = mockLibrary.list.find((item) => item.id === id);

  if (!item) {
    return notFound();
  }

  return (
    <Frame
      asChild
      fade={item.color}
      style={{
        '--flex': 'var(--flex_1)',
        '--display': 'flex',
        '--flex-direction': 'column',
        '--gap': 1,
      }}
    >
      <main>
        <div style={css({ '--display': 'flex', '--px': 5, '--pt': 10, '--pb': 7, '--gap': 6 })}>
          <Cover
            color={item.color}
            size="3xl"
            style={{ '--box-shadow': 'var(--shadow_xl)', '--shadow-color': 'var(--color_blackA5)' }}
          />

          <div
            style={css({
              '--display': 'grid',
              '--grid-template-columns': 'var(---, 1fr)',
              '--grid-template-rows': 'var(---, min-content min-content)',
              '--grid-template-areas': 'var(---, "type" "title")',
              '--mt': 'var(---, auto)',
              '--gap': 1,
            })}
          >
            <Heading
              level={2}
              variant={1}
              style={{
                '--dark_color': 'var(--color_white)',
                '--light_color': 'var(--color_black)',
                '--font-size': 'var(--text-size_7xl)',
                '--font-weight': 'var(--weight_extrabold)',
                '--line-height': 'var(--leading_none)',
                '--grid-area': 'var(---, title)',
              }}
            >
              {item.title}
            </Heading>

            <p
              style={css({
                '--grid-area': 'var(---, type)',
                '--font-weight': 'var(--weight_normal)',
              })}
            >
              {item.type}
            </p>
          </div>
        </div>
        <div
          style={css({
            '--background-color': 'var(--mix-bg_opacity)',
            '--mix-bg-color': 'var(--color_gray2)',
            '--mix-bg-percent': 10,
            '--flex': 'var(--flex_1)',
            '--p': 7,
            '--mx': -2,
          })}
        >
          <IconButton
            icon="play-large-fill"
            size="2xl"
            style={{
              '--background-color': 'var(---, #65D368)',
              '--color': 'var(--color_black)',
              '--hover_background-color': 'var(---, #7DED80)',
              '--hover_color': 'var(--color_black)',
              '--transition': 'var(--morph_colors)',
            }}
          >
            PLay
          </IconButton>
        </div>
      </main>
    </Frame>
  );
}
