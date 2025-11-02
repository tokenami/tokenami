import * as React from 'react';
import { Slider } from '@base-ui-components/react/slider';

/* -------------------------------------------------------------------------------------------------
 * Audio
 * -----------------------------------------------------------------------------------------------*/

function Audio(props: React.ComponentProps<'audio'>) {
  return (
    <div>
      <audio {...props} />
      {props.children}
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * AudioControls
 * -----------------------------------------------------------------------------------------------*/

function AudioControls(props: React.ComponentProps<'div'>) {
  return <div {...props}>{props.children}</div>;
}

/* -------------------------------------------------------------------------------------------------
 * AudioProgress
 * -----------------------------------------------------------------------------------------------*/

function AudioProgress(props: React.ComponentProps<typeof Slider.Root>) {
  return (
    <Slider.Root {...props}>
      <Slider.Value />
      <Slider.Control className="flex w-56 touch-none items-center py-3 select-none">
        <Slider.Track className="h-1 w-full rounded bg-gray-200 shadow-[inset_0_0_0_1px] shadow-gray-200 select-none">
          <Slider.Indicator className="rounded bg-gray-700 select-none" />
          <Slider.Thumb className="size-4 rounded-full bg-white outline outline-1 outline-gray-300 select-none has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue-800" />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  );
}

/* ---------------------------------------------------------------------------------------------- */

export { Audio };
