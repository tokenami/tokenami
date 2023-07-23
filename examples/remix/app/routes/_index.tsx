export const links = () => [{ rel: 'stylesheet', href: '/tokenami.css' }];

export default function Index() {
  return (
    <div
      style={{
        '--font-family': 'var(--font-sans)',
        '--line-height': '1.8',
        '--min-width': 75,
        '--display': 'flex',
        '--align-items': 'center',
        '--justify-content': 'center',
        '--height': 'var(--size-screen-h)',
      }}
    >
      <figure
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
            '--width': 24,
            '--height': 24,
            '--border-radius': 'var(--radii-circle)',
            '--object-fit': 'cover',
            '--md_width': 'var(---,11rem)',
            '--md_height': 'var(--size-auto)',
            '--md_border-radius': 'var(--radii-none)',
          }}
          src="/me.jpg"
          alt=""
          width="400"
          height="400"
        />
        <div style={{ '--pt': 4, '--md_p': 8 }}>
          <blockquote style={{ '--m': 0 }}>
            <p
              style={{
                '--font-size': '1.125rem',
                '--line-height': '1.75rem',
                '--font-weight': '500',
                '--m': 0,
                '--mb': 4,
              }}
            >
              "Like Tailwind, but atomic tokens."
            </p>
          </blockquote>
          <figcaption style={{ '--font-weight': '500' }}>
            <div style={{ '--color': 'var(--color-sky-500)' }}>Jenna Smith</div>
            <div style={{ '--color': 'var(--color-slate-700)' }}>@jjenzz</div>
          </figcaption>
        </div>
      </figure>
    </div>
  );
}
