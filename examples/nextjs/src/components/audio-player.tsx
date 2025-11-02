'use client';

import * as React from 'react';
import { Slot } from './slot';
import { css, type TokenamiStyle } from '@/css';
import { Icon } from '@/components/icon';
import { IconButton } from '@/components/icon-button';
import * as Slider from '@/components/slider';

/* -------------------------------------------------------------------------------------------------
 * AudioPlayer
 * -----------------------------------------------------------------------------------------------*/

interface AudioPlayerProps extends React.ComponentProps<'div'> {
  asChild?: boolean;
}

const AudioPlayer = ({ asChild = false, ...props }: AudioPlayerProps) => {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} />;
};

/* -------------------------------------------------------------------------------------------------
 * AudioPlayerPlayer
 * -----------------------------------------------------------------------------------------------*/

interface AudioPlayerPlayerProps extends TokenamiStyle<React.ComponentProps<'div'>> {}

const AudioPlayerPlayer = (props: AudioPlayerPlayerProps) => {
  const [cn, compose] = audioPlayerPlayer();
  return <div {...props} className={cn(props.className)} style={compose(props.style)} />;
};

/* -------------------------------------------------------------------------------------------------
 * AudioPlayerControls
 * -----------------------------------------------------------------------------------------------*/

interface AudioPlayerControlsProps extends TokenamiStyle<React.ComponentProps<'div'>> {}

const AudioPlayerControls = (props: AudioPlayerControlsProps) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [cn, compose] = audioPlayerControls();

  return (
    <div {...props} className={cn(props.className)} style={compose(props.style)}>
      <IconButton icon="shuffle-line" size="sm">
        Shuffle
      </IconButton>
      <IconButton icon="skip-back-fill" size="sm">
        Previous
      </IconButton>
      <IconButton
        icon={isPlaying ? 'pause-fill' : 'play-fill'}
        size="lg"
        style={{
          '--background-color': 'var(--color_white)',
          '--color': 'var(--color_black)',
          '--hover_background-color': 'var(--color_gray11)',
          '--hover_color': 'var(--color_black)',
        }}
        onClick={() => setIsPlaying(!isPlaying)}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </IconButton>
      <IconButton icon="skip-forward-fill" size="sm">
        Next
      </IconButton>
      <IconButton icon="repeat-line" size="sm">
        Repeat
      </IconButton>
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * AudioPlayerScrubber
 * -----------------------------------------------------------------------------------------------*/

interface AudioPlayerScrubberProps extends TokenamiStyle<React.ComponentProps<'div'>> {}

const AudioPlayerScrubber = (props: AudioPlayerScrubberProps) => {
  const [value, setValue] = React.useState(149);
  const [cn, compose] = audioPlayerScrubber();
  const [timestampCn] = audioPlayerTimestamp();
  const duration = 272;

  return (
    <div {...props} className={cn(props.className)} style={compose(props.style)}>
      <time className={timestampCn()}>{formatTime(value)}</time>
      <Slider.Root
        value={value}
        onValueChange={(newValue) => setValue(newValue as number)}
        min={0}
        max={duration}
        style={css({ '--flex': 'var(--flex_1)' })}
      >
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
      <time className={timestampCn()}>{formatTime(duration)}</time>
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * AudioPlayerVolume
 * -----------------------------------------------------------------------------------------------*/

interface AudioPlayerVolumeProps extends TokenamiStyle<React.ComponentProps<'div'>> {}

const AudioPlayerVolume = (props: AudioPlayerVolumeProps) => {
  const [volume, setVolume] = React.useState(70);
  const [cn, compose] = audioPlayerVolume();

  return (
    <div {...props} className={cn(props.className)} style={compose(props.style)}>
      <Icon
        name="volume-up-line"
        size="lg"
        style={{ '--color': 'var(--color_gray11)' }}
        role="presentation"
      />
      <Slider.Root
        value={volume}
        onValueChange={(newValue) => setVolume(newValue as number)}
        min={0}
        max={100}
        style={css({ '--width': 25 })}
      >
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
    </div>
  );
};

/* ---------------------------------------------------------------------------------------------- */

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const audioPlayerPlayer = css.compose({
  '--display': 'flex',
  '--flex-direction': 'column',
  '--align-items': 'center',
  '--flex': 'var(--flex_1)',
  '--pt': 2,
});

const audioPlayerControls = css.compose({
  '--display': 'flex',
  '--align-items': 'center',
  '--gap': 2,
});

const audioPlayerTimestamp = css.compose({
  '--font': 'var(--text_xs)',
  '--color': 'var(--color_gray11)',
  '--font-variant-numeric': 'tabular-nums',
});

const audioPlayerScrubber = css.compose({
  '--display': 'flex',
  '--align-items': 'center',
  '--gap': 2,
  '--width': 'var(--size_full)',
  '--max-width': 150,
});

const audioPlayerVolume = css.compose({
  '--display': 'flex',
  '--align-items': 'center',
  '--gap': 2,
});

export {
  AudioPlayer as Root,
  AudioPlayerPlayer as Player,
  AudioPlayerControls as Controls,
  AudioPlayerScrubber as Scrubber,
  AudioPlayerVolume as Volume,
};
