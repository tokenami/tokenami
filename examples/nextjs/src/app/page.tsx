import { Frame } from '@/components/frame';
import { css } from '@tokenami/css';
import * as TitleCard from '@/components/title-card';
import { Button } from '@/components/button';
export default function Home() {
  return (
    <Frame
      asChild
      fade="var(--color_iris9)"
      style={{
        '--flex': 'var(--flex_1)',
        '--display': 'flex',
        '--flex-direction': 'column',
        '--gap': 1,
        '--py': 4,
        '--px': 5,
      }}
    >
      <main>
        <div style={css({ '--display': 'flex', '--gap': 1 })}>
          <Button>All</Button>
          <Button>Music</Button>
          <Button>Podcasts</Button>
          <Button>Audiobooks</Button>
        </div>
      </main>
    </Frame>
  );
}
