import React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { keyframes } from '@stitches/react';
import { styled } from 'styles/stitches.config';

const slideDown = keyframes({
  from: { height: 0 },
  to: { height: 'var(--radix-accordion-content-height)' },
});

const slideUp = keyframes({
  from: { height: 'var(--radix-accordion-content-height)' },
  to: { height: 0 },
});

const StyledAccordion = styled(AccordionPrimitive.Root, {
  br: '$default',
  backgroundColor: '$slate2',
  width: '100%',
  border: '1px solid $slate6',
});

const StyledItem = styled(AccordionPrimitive.Item, {
  overflow: 'hidden',
  marginTop: 1,

  '&:first-child': {
    marginTop: 0,
    borderTopLeftRadius: '$default',
    borderTopRightRadius: '$default',
  },

  '&:last-child': {
    borderBottomLeftRadius: '$default',
    borderBottomRightRadius: '$default',
  },

  '&:focus-within': {
    position: 'relative',
    zIndex: 1,
  },
});

const StyledHeader = styled(AccordionPrimitive.Header, {
  all: 'unset',
  display: 'flex',
});

const StyledTrigger = styled(AccordionPrimitive.Trigger, {
  all: 'unset',
  fontFamily: 'inherit',
  backgroundColor: 'transparent',
  px: '$4',
  height: '$7',
  lineHeight: '$normal',
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  color: '$indigo12',
  '&[data-state="closed"]': { backgroundColor: '$slate3' },
  '&[data-state="open"]': { backgroundColor: '$slate3' },
  '&:hover': { backgroundColor: '$indigo3' },
});

const StyledContent = styled(AccordionPrimitive.Content, {
  overflow: 'hidden',
  color: '$slate11',
  backgroundColor: '$slate2',

  '&[data-state="open"]': {
    animation: `${slideDown} 300ms cubic-bezier(0.87, 0, 0.13, 1)`,
  },
  '&[data-state="closed"]': {
    animation: `${slideUp} 300ms cubic-bezier(0.87, 0, 0.13, 1)`,
  },
});

const StyledContentText = styled('div', {
  display: 'flex',
  flexFlow: 'column wrap',
  flex: 1,
  rowGap: '$5',
  px: '$4',
  py: '$5',
});

const StyledChevron = styled(ChevronDownIcon, {
  color: '$indigo9',
  transition: 'transform 300ms cubic-bezier(0.87, 0, 0.13, 1)',
  '[data-state=open] &': { transform: 'rotate(180deg)', color: '$indigo11' },
});

// Exports
export const Accordion = StyledAccordion;
export const AccordionItem = StyledItem;
export const AccordionTrigger = React.forwardRef(
  ({ children, ...props }, forwardedRef) => (
    <StyledHeader>
      <StyledTrigger {...props} ref={forwardedRef}>
        {children}
        <StyledChevron aria-hidden />
      </StyledTrigger>
    </StyledHeader>
  )
);
AccordionTrigger.displayName = 'AccordionTrigger';

export const AccordionContent = React.forwardRef(
  ({ children, ...props }, forwardedRef) => (
    <StyledContent {...props} ref={forwardedRef}>
      <StyledContentText>{children}</StyledContentText>
    </StyledContent>
  )
);
AccordionContent.displayName = 'AccordionContent';
