import type { LinksFunction } from '@remix-run/node';
import styles from '~/../public/tokenami.css';
import { css } from '~/css';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }];

export default function Index() {
  return (
    <div
      style={{
        '---radial-gradient': 'radial-gradient(circle, #000000 1px, rgba(0, 0, 0, 0) 1px)',
        '---grid-bg-size': 'calc(var(--grid) * 5)',
        '--background-size': 'var(---,var(---grid-bg-size) var(---grid-bg-size))',
        '--background-image': 'var(---,var(---radial-gradient))',
        '--background-color': 'var(--color_sky-500)',
        '--background-position-x': 1,
        '--background-position-y': 0.5,
        '--height': 'var(--size_screen-h)',
        '--display': 'flex',
        '--flex-direction': 'column',
        '--align-items': 'center',
        '--justify-content': 'center',
      }}
    >
      <figure
        style={{
          '--bg-color': 'var(--color_slate-100)',
          '--border-radius': 'var(--radii_rounded)',
          '--text-align': 'center',
          '--overflow': 'hidden',
          '--m': 10,
          '--px': 8,
          '--py': 8,
          '--md_display': 'flex',
          '--md_p': 0,
          '--md_text-align': 'left',
          '--font-family': 'var(--font_sans)',
          '--line-height': 'var(---,1.8)',
        }}
      >
        <img
          style={quoteImage({ variant: 'circle', md_variant: 'fill' })}
          src="/me.jpg"
          alt=""
          width="400"
          height="400"
        />
        <div style={{ '--pt': 4, '--md_p': 8 }}>
          <blockquote style={{ '--m': 0 }}>
            <p
              style={{
                '--font-size': 'var(---,1.125rem)',
                '--line-height': 'var(---,1.75rem)',
                '--font-weight': 'var(---,500)',
                '--m': 0,
                '--mb': 4,
              }}
            >
              "Like Tailwind, but atomic tokens."
            </p>
            <div style={{ '--m': 5 }}>
              <div style={{ '--mx': 3 }}>
                <div style={{ '--ml': 12 }}>Testing aliases</div>
              </div>
            </div>
          </blockquote>

          <figcaption style={{ '--font-weight': 'var(---,500)' }}>
            <div style={{ '--color': 'var(--color_sky-500)' }}>Jenna Smith</div>
            <div style={{ '--color': 'var(--color_slate-700)' }}>@jjenzz</div>
          </figcaption>
        </div>
      </figure>

      <button
        style={{
          '--width': 'var(---,180px)',
          '--height': 15,
          '--border-radius': 'var(--radii_rounded)',
          '--border': 'var(---,none)',
          '--font-family': 'var(--font_sans)',
          '--font-size': 'var(---,20px)',
          '--2xl_font-size': 'var(---, 25px)',
          '--bg-color': 'var(--color_slate-100)',
          '--hover_background-color': 'var(--color_slate-700)',
          '--hover_color': 'var(---,white)',
          '--transition': 'var(---,all 150ms)',
          '--hover_animation': 'var(--anim_wiggle)',
          '--focus-hover_background-color': 'var(--color_sky-500)',
          '--md_focus-hover_background-color': 'var(--color_slate-700)',
        }}
      >
        Button
      </button>
    </div>
  );
}

const quoteImage = css(
  { '--object-fit': 'cover' },
  {
    variant: {
      circle: {
        '--width': 24,
        '--height': 24,
        '--border-radius': 'var(--radii_circle)',
      },
      fill: {
        '--width': 'var(---,11rem)',
        '--height': 'var(--size_auto)',
        '--border-radius': 'var(--radii_none)',
      },
    },
  },
  { responsive: true }
);
