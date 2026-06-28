import * as React from 'react';
import { withDefaultConfig } from '../../.storylite/with-default-config';
import { css } from '../css';
import * as Slider from './slider';

const story = withDefaultConfig<typeof SliderExample>({
  title: 'Slider',
  component: SliderExample,
});

export const DefaultStory: typeof story = {
  name: 'Slider',
};

function SliderExample() {
  const [value, setValue] = React.useState(64);

  return (
    <Slider.Root
      value={value}
      onValueChange={(newValue) => setValue(newValue as number)}
      min={0}
      max={100}
      style={css({ '--width': 90 })}
    >
      <Slider.Control>
        <Slider.Track>
          <Slider.Indicator />
          <Slider.Thumb aria-label="Volume" />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  );
}

/* ---------------------------------------------------------------------------------------------- */

export default story;
