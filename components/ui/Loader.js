import { SymbolIcon } from '@radix-ui/react-icons';
import { keyframes } from '@stitches/react';
import { styled } from 'styles/stitches.config';

const loaderSpin = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(359deg)' },
});

const StyledLoader = styled('div', {
  display: 'inline-flex',
  width: '42px',
  height: '42px',
  background: '$slate3',
  alignItems: 'center',
  justifyContent: 'center',
  br: '999px',
  margin: '0 auto',
  'user-select': 'none',

  '& > svg': {
    animation: `${loaderSpin}  2s infinite linear`,
  },
});

export const Loader = () => {
  return (
    <StyledLoader>
      <SymbolIcon />
    </StyledLoader>
  );
};

export default Loader;
