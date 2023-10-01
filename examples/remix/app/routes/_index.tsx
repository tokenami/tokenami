import { css } from '@tokenami/dev';

// TODO
// - figure out why `dev.d.ts` isn't getting FinalConfig
// - figure out a way to hide the `declare global theme` stuff from consumer
// - tokenami should generate responsive styles for `css` variants when { responsive: true }

export const links = () => [{ rel: 'stylesheet', href: '/tokenami.css' }];

export default function Index() {
  return (
    <div
      style={{
        '--radial-gradient': 'radial-gradient(circle, #000000 1px, rgba(0, 0, 0, 0) 1px)',
        '--grid-bg-size': 'calc(var(---grid) * 5)',
        '---background-size': 'var(---,var(--grid-bg-size) var(--grid-bg-size))',
        '---background-image': 'var(---,var(--radial-gradient))',
        '---background-color': 'var(---color-sky-500)',
        '---background-position-x': 1,
        '---background-position-y': 0.5,
        '---height': 'var(---size-screen-h)',
        '---display': 'flex',
        '---flex-direction': 'column',
        '---align-items': 'center',
        '---justify-content': 'center',
      }}
    >
      <figure
        style={{
          '---bg-color': 'var(---color-slate-100)',
          '---border-radius': 'var(---radii-rounded)',
          '---text-align': 'center',
          '---overflow': 'hidden',
          '---m': 10,
          '---p': 8,
          '---md_display': 'flex',
          '---md_p': 0,
          '---md_text-align': 'left',
          '---font-family': 'var(---font-sans)',
          '---line-height': 'var(---,1.8)',
        }}
      >
        <img
          style={quoteImage({ variant: 'circle', md_variant: 'fill' })}
          src="/me.jpg"
          alt=""
          width="400"
          height="400"
        />
        <div style={{ '---pt': 4, '---md_p': 8 }}>
          <blockquote style={{ '---m': 0 }}>
            <p
              style={{
                '---font-size': 'var(---,1.125rem)',
                '---line-height': 'var(---,1.75rem)',
                '---font-weight': 'var(---,500)',
                '---m': 0,
                '---mb': 4,
              }}
            >
              "Like Tailwind, but atomic tokens."
            </p>
          </blockquote>
          <figcaption style={{ '---font-weight': 'var(---,500)' }}>
            <div style={{ '---color': 'var(---color-sky-500)' }}>Jenna Smith</div>
            <div style={{ '---color': 'var(---color-slate-700)' }}>@jjenzz</div>
          </figcaption>
        </div>
      </figure>

      <button
        style={{
          '---width': 'var(---,180px)',
          '---height': 15,
          '---border-radius': 'var(---radii-rounded)',
          '---border': 'var(---,none)',
          '---font-family': 'var(---font-sans)',
          '---font-size': 'var(---,20px)',
          '---bg-color': 'var(---color-slate-100)',
          '---hover_background-color': 'var(---color-slate-700)',
          '---hover_color': 'var(---,white)',
          '---transition': 'var(---,all 150ms)',
          '---hover_animation': 'var(---anim-wiggle)',
        }}
      >
        Button
      </button>
    </div>
  );
}

const quoteImage = css(
  { '---object-fit': 'cover' },
  {
    variant: {
      circle: {
        '---width': 24,
        '---height': 24,
        '---border-radius': 'var(---radii-circle)',
      },
      fill: {
        '---width': 'var(---,11rem)',
        '---height': 'var(---size-auto)',
        '---border-radius': 'var(---radii-none)',
      },
    },
  },
  { responsive: true }
);
