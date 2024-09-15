import * as DS from '@tokenami/example-design-system';
import { css } from '~/css';

export default function Index() {
  return (
    <>
      <figure
        style={css({
          '--bg': 'var(--color_white)',
          '--border-radius': 'var(--radii_lg)',
          '--text-align': 'center',
          '--overflow': 'hidden',
          '--m': 10,
          '--px': 8,
          '--py': 8,
          '--md_display': 'flex',
          '--md_p': 0,
          '--md_text-align': 'left',
          '--font-family': 'var(--font_sans)',
          '--line-height': 'var(--leading_loose)',
          '--after_content': 'var(--pet_favourite)',
          '--md_after_content': 'var(---, "🐠")',
        })}
      >
        <QuoteImage />
        <div style={css({ '--pt': 4, '--md_p': 8 })}>
          <blockquote style={css({ '--m': 0 })}>
            <p
              style={css({
                '--font-size': 'var(--text-size_lg)',
                '--line-height': 'var(--leading_7)',
                '--font-weight': 'var(--weight_medium)',
                '--m': 0,
                '--mb': 4,
                '--selection_background-color': 'var(--color_indigo10)',
                '--selection_color': 'var(--color_white)',
              })}
            >
              "Like Tailwind, but atomic tokens."
            </p>
            <div style={css({ '--m': 5 })}>
              <div style={css({ '--mx': 3 })}>
                <div style={css({ '--ml': 12 })}>Testing aliases</div>
              </div>
            </div>
          </blockquote>

          <figcaption style={css({ '--font-weight': 'var(--weight_medium)' })}>
            <div style={css({ '--color': 'var(--color_indigo10)' })}>Jenna Smith</div>
            <div style={css({ '--color': 'var(--color_amber12)' })}>@jjenzz</div>
          </figcaption>
        </div>
      </figure>

      <div style={css({ '--mb': 5, '--p': 5, '--border': 'var(--line_px)' })}>
        boop
        <div
          style={css({
            '--p': 'inherit',
            '--background-color': 'var(--color_amber12)',
            '--color': 'var(--color_amber9)',
          })}
        >
          Testing inherit
        </div>
      </div>

      <button
        style={css({
          '--border-block-end': 'var(---, 1px solid var(--color_amber12))',
          '--width': 'var(---,180px)',
          '--height': 15,
          '--border-radius': 'var(--radii_3xl)',
          '--border': 'var(--line_0)',
          '--font-family': 'var(--font_sans)',
          '--font-size': 'var(--text-size_xl)',
          '--xxl_font-size': 'var(--text-size_4xl)',
          '--bg': 'var(--color_amber9)',
          '--hover_background-color': 'var(--color_amber12)',
          '--hover_color': 'var(---,white)',
          '--transition': 'var(--morph_all)',
          '--hover_animation': 'var(--anim_pulse)',
          '--{&:focus:hover}_background-color': 'var(--color_indigo10)',
          '--radius-top': 'var(--radii_xl)',
        })}
      >
        Button
      </button>
      <DS.Button style={{ '--border-color': 'var(---, red)' }}>Button</DS.Button>
    </>
  );
}

const QuoteImage = () => {
  const [cn, style] = styles.quoteImage({ variant: 'circle', md_variant: 'fill' });
  return <img className={cn()} style={style()} src="/me.jpg" alt="" width="400" height="400" />;
};

const styles = css.compose({
  quoteImage: {
    '--object-fit': 'cover',

    responsiveVariants: {
      variant: {
        circle: {
          '--width': 24,
          '--height': 24,
          '--border-radius': 'var(--radii_full)',
        },
        fill: {
          '--width': 'var(---,11rem)',
          '--height': 'var(--size_auto)',
          '--border-radius': 'var(--radii_none)',
        },
      },
    },
  },
});
