import * as SwitchPrimitive from '@radix-ui/react-switch';

import { styled } from '@stitches/react';

const StyledSwitch = styled(SwitchPrimitive.Root, {
  all: 'unset',
  width: 42,
  height: 25,
  backgroundColor: '$slate9',
  borderRadius: '9999px',
  position: 'relative',
  WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
  '&[data-state="checked"]': { backgroundColor: '$indigo9' },
  '&:disabled': { backgroundColor: '$slate4' },
});

const StyledThumb = styled(SwitchPrimitive.Thumb, {
  display: 'block',
  width: 21,
  height: 21,
  backgroundColor: 'white',
  borderRadius: '9999px',
  transition: 'transform 100ms',
  transform: 'translateX(2px)',
  willChange: 'transform',
  '&[data-state="checked"]': { transform: 'translateX(19px)' },
  '&[data-disabled]': { backgroundColor: '$slate9' },
});

export const Switch = StyledSwitch;
export const SwitchThumb = StyledThumb;

export default Switch;
