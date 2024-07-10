import React from 'react';
import { SymbolIcon } from '@radix-ui/react-icons';
import { keyframes } from '@stitches/react';
import { styled } from 'styles/stitches.config';

const buttonLoadingSpin = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(359deg)' },
});

const StyledButton = styled('button', {
  // Reset
  all: 'unset',
  boxSizing: 'border-box',
  userSelect: 'none',
  '&::before': {
    boxSizing: 'border-box',
  },
  '&::after': {
    boxSizing: 'border-box',
  },
  display: 'flex',
  flexShrink: 0,
  lineHeight: '$normal',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'center',
  justifyContent: 'center',
  alignItems: 'center',
  br: '$default',

  fontFamily: '$sans',
  fontSize: '$2',
  fontWeight: '$semibold',

  '&:disabled': {
    backgroundColor: '$slate3',
    color: '$slate9',
    cursor: 'not-allowed',
    '&:hover': {
      backgroundColor: '$slate3',
      color: '$slate9',
      boxShadow: '$none',
    },
    '&:focus': {
      backgroundColor: '$slate3',
      color: '$slate9',
      boxShadow: '$none',
    },
  },

  variants: {
    color: {
      default: {
        backgroundColor: '$indigo4',
        color: '$indigo11',
        '&:hover': {
          backgroundColor: '$indigo5',
        },
        '&:focus': {
          backgroundColor: '$indigo6',
        },
      },

      secondary: {
        backgroundColor: '$sky4',
        color: '$sky11',
        '&:hover': {
          backgroundColor: '$sky5',
        },
        '&:focus': {
          backgroundColor: '$sky6',
        },
      },

      warning: {
        backgroundColor: '$amber4',
        color: '$amber11',
        '&:hover': {
          backgroundColor: '$amber5',
        },
        '&:focus': {
          backgroundColor: '$amber6',
        },
      },

      danger: {
        backgroundColor: '$crimson4',
        color: '$crimson11',
        '&:hover': {
          backgroundColor: '$crimson5',
        },
        '&:focus': {
          backgroundColor: '$crimson6',
        },
      },
    },

    size: {
      small: {
        height: '$6',
        px: '$5',
        fontSize: '$1',
        lineHeight: '$none',
        br: '$sm',
      },
      medium: {
        height: '$7',
        px: '$6',
        fontSize: '$2',
        lineHeight: '$none',
      },

      icon: {
        height: '$7',
        width: '$7',
      },
    },
    fullWidth: {
      true: {
        width: '100%',
      },
    },
  },

  compoundVariants: [
    {
      color: 'default',
      outlined: true,
      css: {
        border: '1px solid $indigo6',
        backgroundColor: 'transparent',
        color: '$indigo11',

        '&:hover': {
          backgroundColor: '$indigo3',
          borderColor: '$indigo8',
        },
        '&:focus': {
          backgroundColor: '$indigo3',
        },
      },
    },
    {
      color: 'danger',
      outlined: true,
      css: {
        border: '1px solid $crimson6',
        backgroundColor: 'transparent',
        color: '$crimson11',

        '&:hover': {
          backgroundColor: '$crimson3',
          borderColor: '$crimson8',
        },
        '&:focus': {
          backgroundColor: '$crimson3',
        },
      },
    },
    {
      loading: true,
      css: {
        cursor: 'wait',
        'pointer-events': 'none',
        '& > svg': {
          animation: `${buttonLoadingSpin}  2s infinite linear`,
        },
      },
    },
  ],

  defaultVariants: {
    size: 'medium',
    outlined: false,
    fullWidth: false,
    color: 'default',
    loading: false,
  },
});

export const Button = React.forwardRef(
  (
    {
      children,
      css,
      disabled,
      fullWidth = false,
      loading = false,
      size = 'medium',
      type = 'button',
      outlined = false,
      variant = 'default',
      ...rest
    },
    ref
  ) => {
    return (
      <StyledButton
        variant={variant}
        size={size}
        outlined={outlined}
        disabled={disabled}
        loading={loading}
        fullWidth={fullWidth}
        ref={ref}
        type={type}
        css={css}
        {...rest}
      >
        {loading ? <SymbolIcon /> : children}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';

Button.defaultProps = {
  variant: 'default',
  fullWidth: false,
  disabled: false,
  size: 'medium',
};

export default Button;
