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
      <figure style={card()}>
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
                <p style={{ '--ml': 12 }}>Testing aliases</p>
              </div>
            </div>
          </blockquote>

          <figcaption style={{ '--font-weight': 'var(---,500)' }}>
            <div style={{ '--color': 'var(--color_sky-500)' }}>Jenna Smith</div>
            <div style={{ '--color': 'var(--color_slate-700)' }}>@jjenzz</div>
          </figcaption>
        </div>
      </figure>

      <div
        style={{
          '--display': 'flex',
          '--flex-direction': 'column',
          '--gap': 2,
          '--align-items': 'center',
        }}
      >
        <Button>Button</Button>
        <Link href="#" style={button()} className={button.class()}>
          Link button
        </Link>
      </div>
      <div style={card(null, { '--p': 10, '--md_p': 10 })}>
        <Link href="#">Link</Link>
      </div>
    </div>
  );
}

const card = css({
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
});

const button = css.compose({
  '--width': 45,
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
  '--text-decoration': 'none',
  '--text-align': 'center',
  '--color': 'var(---,black)',
  '--py': 5,
  '--px': 3,
});

const Button = (props: React.ComponentProps<'button'>) => {
  const { className, style, ...buttonProps } = props;
  return (
    <button {...buttonProps} style={button(null, style)} className={button.class(className)} />
  );
};

const link = css.compose({
  '--font-family': 'var(--font_sans)',
  '--color': 'var(--color_sky-500)',
});

const Link = (props: React.ComponentProps<'a'>) => {
  const { className, style, ...linkProps } = props;
  return <a {...linkProps} style={link(null, style)} className={link.class(className)} />;
};

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
