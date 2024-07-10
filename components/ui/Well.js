import { styled } from 'styles/stitches.config';

export const Well = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  backgroundColor: '$crimson3',
  color: '$crimson12',
  br: '$default',
  p: '$4',

  'h1, h2, h3, h4': {
    color: '$crimson11',
  },

  svg: {
    marginRight: '$3',
    color: '$slate11',
  },

  variants: {
    color: {
      secondary: {
        backgroundColor: '$sky3',
        color: '$sky12',

        svg: {
          color: '$sky11',
        },
      },
    },
  },
});

export default Well;
