export const links = () => [{ rel: 'stylesheet', href: '/tokenami.css' }];

export default function Index() {
  return (
    <div
      style={{
        '--radial-gradient': 'radial-gradient(circle, #000000 1px, rgba(0, 0, 0, 0) 1px)',
        '--grid-bg-size': 'calc(var(---grid) * 5)',
        '--background-size': 'var(--_) var(--grid-bg-size) var(--grid-bg-size)',
        '--background-image': 'var(--_) var(--radial-gradient)',
        '--background-color': 'var(---color-sky-500)',
        '--background-position-x': 1,
        '--background-position-y': 0.5,
        '--height': 'var(---size-screen-h)',
        '--display': 'var(--_) flex',
        '--flex-direction': 'var(--_) column',
        '--align-items': 'var(--_) center',
        '--justify-content': 'var(--_) center',
      }}
    >
      <figure
        style={{
          '--bg-color': 'var(---color-slate-100)',
          '--border-radius': 'var(---radii-rounded)',
          '--text-align': 'var(--_) center',
          '--overflow': 'var(--_) hidden',
          '--m': 10,
          '--p': 8,
          '--md_display': 'var(--_) flex',
          '--md_p': 0,
          '--md_text-align': 'var(--_) left',
          '--font-family': 'var(---font-sans)',
          '--line-height': 'var(--_) 1.8',
        }}
      >
        <img
          style={{
            '--width': 24,
            '--height': 24,
            '--border-radius': 'var(---radii-circle)',
            '--object-fit': 'var(--_) cover',
            '--md_width': 'var(--_) 11rem',
            '--md_height': 'var(---size-auto)',
            '--md_border-radius': 'var(---radii-none)',
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
                '--font-size': 'var(--_) 1.125rem',
                '--line-height': 'var(--_) 1.75rem',
                '--font-weight': 'var(--_) 500',
                '--m': 0,
                '--mb': 4,
              }}
            >
              "Like Tailwind, but atomic tokens."
            </p>
          </blockquote>
          <figcaption style={{ '--font-weight': 'var(--_) 500' }}>
            <div style={{ '--color': 'var(---color-sky-500)' }}>Jenna Smith</div>
            <div style={{ '--color': 'var(---color-slate-700)' }}>@jjenzz</div>
          </figcaption>
        </div>
      </figure>

      <button
        style={{
          '--width': 'var(--_) 180px',
          '--height': 15,
          '--border-radius': 'var(---radii-rounded)',
          '--border': 'var(--_) none',
          '--font-family': 'var(---font-sans)',
          '--font-size': 'var(--_) 20px',
          '--bg-color': 'var(---color-slate-100)',
          '--hover_background-color': 'var(---color-slate-700)',
          '--hover_color': 'var(--_) white',
          '--transition': 'var(--_) all 150ms',
        }}
      >
        Button
      </button>
    </div>
  );
}
