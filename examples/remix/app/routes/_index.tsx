import type { V2_MetaFunction } from '@remix-run/node';

export const links = () => [{ rel: 'stylesheet', href: '/tokenami.css' }];

export const meta: V2_MetaFunction = () => {
  return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }];
};

export default function Index() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8', '--min-width': '300px' }}>
      {Array.from({ length: 500 }, (_, i) => (
        <figure
          key={i}
          style={{
            '--bg-color': 'var(--color-slate-100)',
            '--border-radius': 'var(--radii-rounded)',
            '--text-align': 'center',
            '--overflow': 'hidden',
            '--m': 10,
            '--p': 8,
            '--md_display': 'flex',
            '--md_p': 0,
            '--md_text-align': 'left',
          }}
        >
          <img
            style={{
              '--width': '96px',
              '--height': '96px',
              '--border-radius': 'var(--radii-circle)',
              '--object-fit': 'cover',
              '--md_width': '11rem',
              '--md_height': 'auto',
              '--md_border-radius': 0,
            }}
            src="/me.jpg"
            alt=""
            width="400"
            height="400"
          />
          <div
            style={{
              '--pt': 4,
              '--md_text-align': 'left',
              '--md_p': 8,
            }}
          >
            <blockquote style={{ '--m': 0 }}>
              <p
                style={{
                  '--font-size': '1.125rem',
                  '--line-height': '1.75rem',
                  '--font-weight': '500',
                }}
              >
                “Tailwind CSS is the only framework that I've seen scale on large teams. It’s easy
                to customize, adapts to any design, and the build size is tiny.”
              </p>
            </blockquote>
            <figcaption style={{ '--font-weight': '500' }}>
              <div style={{ '--color': 'var(--color-sky-500)' }}>Sarah Dayan</div>
              <div style={{ '--color': 'var(--color-slate-700)' }}>Staff Engineer, Algolia</div>
            </figcaption>
          </div>
        </figure>
      ))}
    </div>
  );
}
