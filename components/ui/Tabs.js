import { slateDark } from '@radix-ui/colors';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { styled } from 'styles/stitches.config';

const StyledTabs = styled(TabsPrimitive.Root, {
  display: 'flex',
  flexDirection: 'column',
});

const StyledList = styled(TabsPrimitive.List, {
  flexShrink: 0,
  display: 'flex',
  marginBottom: '$6',
  boxShadow: `inset 0 -1px 0 ${slateDark.slate6}`,
  boxSizing: 'border-box',
  columnGap: '$4',
});

const StyledTrigger = styled(TabsPrimitive.Trigger, {
  all: 'unset',
  position: 'relative',
  fontFamily: 'inherit',
  padding: '0 0 $4 0',
  fontSize: '$2',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '$semibold',
  lineHeight: 1,
  color: '$indigo11',
  borderBottom: '1px solid $slate6',
  userSelect: 'none',

  '&:first-child': { borderTopLeftRadius: 6 },
  '&:last-child': { borderTopRightRadius: 6 },
  '&:hover': { color: '$indigo11' },
  '&[data-state="active"]': {
    color: '$indigo12',
    borderBottom: `1px solid $indigo11`,
  },
  '&:focus': { position: 'relative' },
});

const StyledContent = styled(TabsPrimitive.Content, {});

// Exports
export const Tabs = StyledTabs;
export const TabsList = StyledList;
export const TabsTrigger = StyledTrigger;
export const TabsContent = StyledContent;
