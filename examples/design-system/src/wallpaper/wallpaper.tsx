import * as React from 'react';
import { type TokenamiStyle, css } from '~/css';

/* -------------------------------------------------------------------------------------------------
 * Wallpaper
 * -----------------------------------------------------------------------------------------------*/

type WallpaperElement = React.ElementRef<'div'>;
type WallpaperElementProps = React.ComponentPropsWithoutRef<'div'>;
interface WallpaperProps extends TokenamiStyle<WallpaperElementProps> {}

const Wallpaper = React.forwardRef<WallpaperElement, WallpaperProps>((props, forwardedRef) => (
  <div
    {...props}
    ref={forwardedRef}
    style={css(
      {
        '---surface-from': 'var(--color_primary)',
        '---surface-to': 'var(--color_secondary)',
        '--background-image': 'var(--surface_radial-gradient-t)',
        '--background-color': 'var(--color_secondary)',
        '--light_mix-blend-mode': 'hue',
        '--dark_mix-blend-mode': 'normal',
        '--size': 'var(--size_fill)',
      },
      props.style
    )}
  />
));

/* ---------------------------------------------------------------------------------------------- */

export { Wallpaper };
