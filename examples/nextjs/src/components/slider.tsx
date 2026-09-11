import * as React from 'react';
import { Slider as SliderPrimitive } from '@base-ui-components/react/slider';
import { css, type TokenamiStyle } from '@/css';

/* -------------------------------------------------------------------------------------------------
 * Slider
 * -----------------------------------------------------------------------------------------------*/

interface SliderProps extends TokenamiStyle<React.ComponentProps<typeof SliderPrimitive.Root>> {}

const Slider = (props: SliderProps) => {
  return <SliderPrimitive.Root {...props} style={css(props.style)} />;
};

/* -------------------------------------------------------------------------------------------------
 * SliderControl
 * -----------------------------------------------------------------------------------------------*/

interface SliderControlProps
  extends TokenamiStyle<Omit<React.ComponentProps<typeof SliderPrimitive.Control>, 'className'>> {
  className?: string;
}

const SliderControl = (props: SliderControlProps) => {
  const [cn, sx] = sliderControl();
  const { className, style, ...rest } = props;
  return <SliderPrimitive.Control {...rest} className={cn(className)} style={sx(style)} />;
};

/* -------------------------------------------------------------------------------------------------
 * SliderTrack
 * -----------------------------------------------------------------------------------------------*/

interface SliderTrackProps
  extends TokenamiStyle<Omit<React.ComponentProps<typeof SliderPrimitive.Track>, 'className'>> {
  className?: string;
}

const SliderTrack = (props: SliderTrackProps) => {
  const [cn, sx] = sliderTrack();
  const { className, style, ...rest } = props;
  return <SliderPrimitive.Track {...rest} className={cn(className)} style={sx(style)} />;
};

/* -------------------------------------------------------------------------------------------------
 * SliderIndicator
 * -----------------------------------------------------------------------------------------------*/

interface SliderIndicatorProps
  extends TokenamiStyle<Omit<React.ComponentProps<typeof SliderPrimitive.Indicator>, 'className'>> {
  className?: string;
}

const SliderIndicator = (props: SliderIndicatorProps) => {
  const [cn, sx] = sliderIndicator();
  const { className, style, ...rest } = props;
  return <SliderPrimitive.Indicator {...rest} className={cn(className)} style={sx(style)} />;
};

/* -------------------------------------------------------------------------------------------------
 * SliderThumb
 * -----------------------------------------------------------------------------------------------*/

interface SliderThumbProps
  extends TokenamiStyle<Omit<React.ComponentProps<typeof SliderPrimitive.Thumb>, 'className'>> {
  className?: string;
}

const SliderThumb = (props: SliderThumbProps) => {
  const [cn, sx] = sliderThumb();
  const { className, style, ...rest } = props;
  return <SliderPrimitive.Thumb {...rest} className={cn(className)} style={sx(style)} />;
};

/* ---------------------------------------------------------------------------------------------- */

const sliderControl = css.compose({
  '--display': 'flex',
  '--align-items': 'center',
  '--user-select': 'none',
  '--touch-action': 'none',
  '--py': 3,
  '--width': 'var(--size_full)',
});

const sliderTrack = css.compose({
  '--position': 'relative',
  '--height': 1,
  '--width': 'var(--size_full)',
  '--border-radius': 'var(--radii_full)',
  '--background-color': 'var(--color_gray6)',
  '--user-select': 'none',
});

const sliderIndicator = css.compose({
  '--position': 'absolute',
  '--height': 'var(--size_full)',
  '--border-radius': 'var(--radii_full)',
  '--background-color': 'var(--color_gray11)',
  '--user-select': 'none',
});

const sliderThumb = css.compose({
  '--position': 'absolute',
  '--width': 3,
  '--height': 3,
  '--border-radius': 'var(--radii_full)',
  '--background-color': 'var(--color_white)',
  '--user-select': 'none',
  '--outline': 'var(--line_px)',
  '--outline-color': 'var(--color_gray8)',
  '--hover_outline-color': 'var(--color_white)',
  '--top': '-0.25rem',
  '--transition': 'var(--morph_colors)',
});

export {
  Slider as Root,
  SliderControl as Control,
  SliderTrack as Track,
  SliderIndicator as Indicator,
  SliderThumb as Thumb,
};
