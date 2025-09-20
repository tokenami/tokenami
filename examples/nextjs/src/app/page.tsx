import { Frame } from '@/components/frame';
import * as ButtonGroup from '@/components/button-group';

export default function Home() {
  return (
    <Frame
      color="iris"
      style={{
        '--display': 'flex',
        '--flex-direction': 'column',
        '--gap': 1,
        '--py': 4,
        '--px': 5,
      }}
    >
      <ButtonGroup.Root>
        <ButtonGroup.Button>All</ButtonGroup.Button>
        <ButtonGroup.Button>Music</ButtonGroup.Button>
        <ButtonGroup.Button>Podcasts</ButtonGroup.Button>
        <ButtonGroup.Button>Audiobooks</ButtonGroup.Button>
      </ButtonGroup.Root>
    </Frame>
  );
}
