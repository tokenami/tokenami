import * as React from 'react';
import { type TokenamiStyle, css } from '@/css';
import { Icon } from '@/components/icon';

/* -------------------------------------------------------------------------------------------------
 * Search
 * -----------------------------------------------------------------------------------------------*/

const Search = (props: TokenamiStyle<React.ComponentProps<'input'>>) => {
  const [formCn, formCss] = searchForm();
  const [inputCn, inputCss] = searchInput();
  return (
    <form className={formCn('group')} style={formCss()}>
      <Icon
        name="search-line"
        size="lg"
        style={{
          '--ml': -1.5,
          '--color': 'var(--color_gray11)',
          '--transition': 'var(--morph_colors)',
          '--group-hover_color': 'var(--color_current)',
        }}
      />
      <input
        placeholder="What do you want to play?"
        {...props}
        className={inputCn(props.className)}
        style={inputCss(props.style)}
      />
    </form>
  );
};

const searchForm = css.compose({
  '--display': 'flex',
  '--align-items': 'center',
  '--border-radius': 'var(--radii_full)',
  '--background-color': 'var(--color_gray2)',
  '--transition': 'var(--morph_colors)',
  '--color': 'var(--color_gray12)',
  '--width': 'var(--fluid-width-clamp_min-max)',
  '--fluid-width-min': 75,
  '--fluid-width-max': 100,
  '--gap': 2,
  '--px': 4,

  '--hover_background-color': 'var(--color_gray5)',
  '--focus-within_background-color': 'var(--color_gray5)',
  '--hover_color': 'var(--color_gray12)',
});

const searchInput = css.compose({
  '--border': 'var(--line_0)',
  '--outline': 'var(--line_0)',
  '--font-size': 'var(--text-size_sm)',
  '--font-weight': 'var(--weight_light)',
  '--background-color': 'var(--color_transparent)',
  '--flex': 'var(--flex_1)',
  '--h': 10,
});

export { Search };
