import * as React from 'react';
import * as DS from '@tokenami/example-design-system';
import { TokenamiStyle, css } from './css';

export default function Index() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const selectionRef = React.useRef<HTMLParagraphElement>(null);

  useTextSelectionParam('percy-select', selectionRef, () => {
    window.dispatchEvent(new CustomEvent('percy-selection-ready'));
  });

  return (
    <div
      data-theme={theme}
      style={css({
        '--min-height': 'var(--size_screen-h)',
        '---radial-gradient': 'radial-gradient(circle, #000000 1px, rgba(0, 0, 0, 0) 1px)',
        '---grid-bg-size': 'calc(var(--_grid) * 5)',
        '--background-size': 'var(---,var(---grid-bg-size) var(---grid-bg-size))',
        '--background-image': 'var(---,var(---radial-gradient))',
        '--background-color': 'var(--color_indigo6)',
        '--background-position-x': 1,
        '--background-position-y': 0.5,
        '--display': 'flex',
        '--flex-direction': 'column',
        '--align-items': 'center',
        '--justify-content': 'center',
        '--child-p_background-color': 'var(--color_indigo5)',
        '--child-p_border-radius': 'var(--radii_sm)',
        '--child-p_px': 2,
      })}
    >
      <DS.Button
        data-testid="theme-button"
        onClick={() => setTheme((theme) => (theme === 'light' ? 'dark' : 'light'))}
      >
        Switch theme
      </DS.Button>

      <div
        style={css({
          '--position': 'relative',
          '--z-index': 0,
          '--padding': 5,
          '--m': 2,
          '--color': 'var(--color_white)',
          '--before_content': 'var(---, "")',
          '--before_inset': 0,
          '--before_z-index': -1,
          '--before_position': 'absolute',
          '--before_background': 'var(--gradient_to-b)',
          '--before_gradient-from': 'var(--color_green9)',
          '--before_gradient-to': 'var(--color_red9)',
        })}
      >
        should have gradient bg on pseudo element
      </div>

      <figure
        style={css({
          '--bg': 'var(--color_white)',
          '--border-radius': 'var(--radii_lg)',
          '--text-align': 'center',
          '--overflow': 'hidden',
          '--m': 10,
          '--px': 8,
          '--py': 8,
          '--display': 'grid',
          '--justify-items': 'center',
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
              ref={selectionRef}
              data-testid="selection"
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
            <div style={css({ '--bg': 'var(--color_gray7)', '--color': 'var(--color_white)' })}>
              <div style={css({ '--m': 5, '--bg': 'var(--color_gray8)' })}>
                <div style={css({ '--mx': 3, '--bg': 'var(--color_gray10)' })}>
                  <div style={css({ '--ml': 12, '--bg': 'var(--color_gray11)' })}>
                    Testing alias margins
                  </div>
                </div>
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
        <div
          style={css({
            '--p': 'inherit',
            '--background-color': 'var(--color_amber12)',
            '--color': 'var(--color_amber9)',
          })}
        >
          Should inherit 20px padding from border box parent
        </div>
      </div>

      <div
        style={css({
          '--prose-p_background-color': 'var(--color_red8)',
          '--prose-card_background-color': 'var(--color_amber8)',
          '--my': 10,
        })}
      >
        Testing prose
        <div className="card">
          <p>i should be red</p>
          <span>i should be amber</span>
        </div>
      </div>

      <button
        data-testid="hover-button"
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

      <div style={css({ '--width': 100, '--background': 'var(--color_indigo10)', '--mt': 5 })}>
        <div style={css({ '--width': 'var(--size_half)', '--background': 'var(--color_indigo8)' })}>
          should be 50% width
        </div>
      </div>
    </div>
  );
}

const QuoteImage = (props: TokenamiStyle<React.ComponentProps<'img'>>) => {
  const [cn, css] = quoteImage({ variant: 'circle', md_variant: 'fill' });
  return (
    <img
      className={cn(props.className)}
      style={css(props.style)}
      src="/me.jpg"
      alt=""
      width="400"
      height="400"
    />
  );
};

const test = css.compose({
  '--border': 'var(--line_8)',
  '--border-color': 'var(--color_red10)',
});

const util = css({ '--border-width': 'var(--line-size_4)' });

const quoteImage = css.compose({
  includes: [test, util],

  '--object-fit': 'cover',
  '--border-color': 'var(--color_iris10)',

  variants: {
    variant: {
      circle: {
        '--width': 24,
        '--height': 24,
        '--border-radius': 'var(--radii_full)',
      },
    },
    md_variant: {
      fill: {
        '--md_width': 'var(---,11rem)',
        '--md_height': 'var(--size_auto)',
        '--md_border-radius': 'var(--radii_none)',
      },
    },
  },
});

const useTextSelectionParam = (
  param: string,
  selectionRef: React.RefObject<HTMLParagraphElement | null>,
  onComplete: () => void
) => {
  const handleComplete = React.useRef(onComplete);

  React.useLayoutEffect(() => {
    handleComplete.current = onComplete;
  });

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (!params.has(param)) return;

    const p = selectionRef.current;
    const node = p?.firstChild;
    if (node && node.nodeType === Node.TEXT_NODE) {
      const r = document.createRange();
      const sel = window.getSelection();

      sel?.removeAllRanges();
      r.setStart(node, 0);
      r.setEnd(node, Math.min(node.textContent?.length ?? 0, 12));
      sel?.addRange(r);

      if (sel && sel.rangeCount > 0) {
        handleComplete.current();
      }
    }
  }, []);
};
