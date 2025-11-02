import * as React from 'react';
import { Slider as SliderPrimitive } from '@base-ui-components/react/slider';
import { css, type TokenamiStyle } from '@/css';

/* -------------------------------------------------------------------------------------------------
 * Slider
 * -----------------------------------------------------------------------------------------------*/

interface SliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {}

const Slider = (props: SliderProps) => {
  return <SliderPrimitive.Root {...props} />;
};

/* -------------------------------------------------------------------------------------------------
 * SliderControl
 * -----------------------------------------------------------------------------------------------*/

interface SliderControlProps
  extends TokenamiStyle<React.ComponentProps<typeof SliderPrimitive.Control>> {}

const SliderControl = (props: SliderControlProps) => {
  const [cn, compose] = sliderControl();
  const { className, style, ...rest } = props;
  return <SliderPrimitive.Control {...rest} className={cn()} style={compose(style)} />;
};

/* -------------------------------------------------------------------------------------------------
 * SliderTrack
 * -----------------------------------------------------------------------------------------------*/

interface SliderTrackProps
  extends TokenamiStyle<React.ComponentProps<typeof SliderPrimitive.Track>> {}

const SliderTrack = (props: SliderTrackProps) => {
  const [cn, compose] = sliderTrack();
  const { className, style, ...rest } = props;
  return <SliderPrimitive.Track {...rest} className={cn()} style={compose(style)} />;
};

/* -------------------------------------------------------------------------------------------------
 * SliderIndicator
 * -----------------------------------------------------------------------------------------------*/

interface SliderIndicatorProps
  extends TokenamiStyle<React.ComponentProps<typeof SliderPrimitive.Indicator>> {}

const SliderIndicator = (props: SliderIndicatorProps) => {
  const [cn, compose] = sliderIndicator();
  const { className, style, ...rest } = props;
  return <SliderPrimitive.Indicator {...rest} className={cn()} style={compose(style)} />;
};

/* -------------------------------------------------------------------------------------------------
 * SliderThumb
 * -----------------------------------------------------------------------------------------------*/

interface SliderThumbProps
  extends TokenamiStyle<React.ComponentProps<typeof SliderPrimitive.Thumb>> {}

const SliderThumb = (props: SliderThumbProps) => {
  const [cn, compose] = sliderThumb();
  const { className, style, ...rest } = props;
  return <SliderPrimitive.Thumb {...rest} className={cn()} style={compose(style)} />;
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
  '--top': 'var(---,-0.25rem)',
  '--transition': 'var(--morph_colors)',
});

export {
  Slider as Root,
  SliderControl as Control,
  SliderTrack as Track,
  SliderIndicator as Indicator,
  SliderThumb as Thumb,
};
