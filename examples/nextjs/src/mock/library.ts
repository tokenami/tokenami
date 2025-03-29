import { Frame } from '@/components/frame';

export const list: {
  id: string;
  title: string;
  type: string;
  author: string;
  color: React.ComponentProps<typeof Frame>['fade'];
}[] = [
  {
    id: '1',
    title: 'Daily Mix 1',
    type: 'Playlist',
    author: 'Spotify',
    color: 'var(--color_iris8)',
  },
  {
    id: '2',
    title: 'Chill Vibes',
    type: 'Playlist',
    author: 'User123',
    color: 'var(--color_sky8)',
  },
  { id: '3', title: 'Top Hits', type: 'Playlist', author: 'Spotify', color: 'var(--color_green8)' },
  {
    id: '4',
    title: 'Workout Mix',
    type: 'Playlist',
    author: 'User456',
    color: 'var(--color_orange8)',
  },
  {
    id: '5',
    title: 'Jazz Classics',
    type: 'Playlist',
    author: 'User789',
    color: 'var(--color_yellow8)',
  },
];
