import type { V2_MetaFunction } from '@remix-run/node';

export const links = () => [{ rel: 'stylesheet', href: '/tokenami.css' }];

export const meta: V2_MetaFunction = () => {
  return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }];
};

export default function Index() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
      <button
        style={{
          '--border-radius': 'var(--radii-rounded)',
          '--font-size': '20px',
          '--color': 'var(--color-white)',
          '--bg-color': 'var(--color-blue100)',
          '--p': 3,
          '--hover_bg-color': 'var(--color-green100)',
          '--md_font-size': '40px',
          '--md_bg-color': 'var(--color-red100)',
        }}
      >
        hello
      </button>

      <div style={{ '--background-color': 'blue', '--color': 'white', '--mt': 10 }}>
        <div style={{ '--pt': 30, '--p': 5 }}>foo</div>
      </div>
    </div>
  );
}
