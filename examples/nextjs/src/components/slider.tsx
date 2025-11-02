import * as React from 'react';
import { Slider as SliderPrimitive } from '@base-ui-components/react/slider';
import { css } from '@/css';

/* -------------------------------------------------------------------------------------------------
 * Slider
 * -----------------------------------------------------------------------------------------------*/

function Slider(props: React.ComponentProps<typeof SliderPrimitive.Root>) {
  return <SliderPrimitive.Root {...props} />;
}

/* -------------------------------------------------------------------------------------------------
 * SliderValue
 * -----------------------------------------------------------------------------------------------*/

function SliderValue(props: React.ComponentProps<typeof SliderPrimitive.Value>) {
  return <SliderPrimitive.Value {...props} />;
}

/* -------------------------------------------------------------------------------------------------
 * SliderControl
 * -----------------------------------------------------------------------------------------------*/

function SliderControl(props: React.ComponentProps<typeof SliderPrimitive.Control>) {
  return (
    <SliderPrimitive.Control className="flex w-56 touch-none items-center py-3 select-none">
      <SliderPrimitive.Track className="h-1 w-full rounded bg-gray-200 shadow-[inset_0_0_0_1px] shadow-gray-200 select-none">
        <SliderPrimitive.Indicator className="rounded bg-gray-700 select-none" />
        <SliderPrimitive.Thumb className="size-4 rounded-full bg-white outline outline-1 outline-gray-300 select-none has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue-800" />
      </SliderPrimitive.Track>
    </SliderPrimitive.Control>
  );
}

/* ---------------------------------------------------------------------------------------------- */

const sliderControl = css.compose({
  '--display': 'flex',
  '--align-items': 'center',
  '--user-select': 'none',
  '--touch-action': 'none',
  '--py': 3,
  '--w': 56,
});

const sliderTrack = css.compose({
  '--h': 1,
  '--w': 'var(--size_full)',
  '--border-radius': 'var(--radii_md)',
  '--bg': 'var(--color_gray2)',
  '--user-select': 'none',
});

export { Slider };
