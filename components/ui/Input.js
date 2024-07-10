import { styled } from 'styles/stitches.config';

export const Input = ({ field, ...props }) => (
  <StyleInput type="text" {...field} {...props} />
);

export const StyleInput = styled('input', {
  appearance: 'none',
  width: '100%',
  br: '$default',
  '-webkit-appearance': 'none',
  boxSizing: 'border-box',
  cursor: 'pointer',
  display: 'inline-block',
  fontFamily: '$sans',
  height: '$7',
  px: '$4',
  fontSize: '$2',
  lineHeight: '$none',
  transition: '$default',
  border: '1px solid $slate6',
  backgroundColor: '$slate1',
  color: '$slate12',

  '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
  '&[type=number]': {
    '-moz-appearance': 'textfield',
  },

  '&[disabled], > option[disabled]': {
    backgroundColor: '$slate1',
    color: '$slate6',
    cursor: 'not-allowed',
  },
  '&::placeholder': {
    color: '$slate7',
    opacity: 1,
  },

  '&:hover': {
    borderColor: '$indigo8',
    backgroundColor: '$slate1',
    outline: 'none',
  },

  '&:focus': {
    borderColor: '$indigo9',
    color: '$indigo12',
    outline: 'none',
    boxShadow: '$ringPrimary',
  },
});

export default Input;
