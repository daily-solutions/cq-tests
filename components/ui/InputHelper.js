import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { Tooltip, TooltipTrigger, TooltipContent } from 'components/ui/Tooltip';
import { styled } from 'styles/stitches.config';

const StyledHelperIcon = styled(QuestionMarkCircledIcon, {
  color: '$slate9',
  '&:hover': {
    color: '$sky9',
  },
});

export const InputHelper = ({ text }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <StyledHelperIcon />
    </TooltipTrigger>
    <TooltipContent sideOffset={5}>{text}</TooltipContent>
  </Tooltip>
);

export default InputHelper;
