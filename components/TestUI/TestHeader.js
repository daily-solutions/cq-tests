import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { PersonIcon } from '@radix-ui/react-icons';
import { TimerIcon } from '@radix-ui/react-icons';
import Button from 'components/ui/Button';
import { useTest } from 'contexts/TestProvider';
import moment from 'moment';
import { useRouter } from 'next/router';
import { styled } from 'styles/stitches.config';
import { PROVIDER_MAPPING } from 'utils/constants';

const StyledHeader = styled('header', {
  background: '$slate2',
  padding: '$3',
  display: 'flex',
  flexFlow: 'row no-wrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid $slate6',
});

const StyledCardHolder = styled('div', {
  display: 'flex',
  columnGap: '$3',
  alignItems: 'center',
});

const StyleCallState = styled('div', {
  fontSize: '$2',
  span: {
    fontWeight: '$semibold',
    color: '$slate12',
  },
});

const StyledHeaderCard = styled('div', {
  display: 'flex',
  background: '$slate3',
  height: '$7',
  px: '$4',
  color: '$slate12',
  fontSize: '$2',
  lineHeight: '$none',
  alignItems: 'center',
  br: '$default',
  columnGap: '$2',
  flexBasis: 0,
  flexGrow: 0,

  svg: {
    color: '$slate11',
  },

  '&.strong, .strong': {
    fontWeight: '$semibold',
  },

  '&.done': {
    background: '$grass3',
    color: '$grass11',

    svg: {
      color: '$grass11',
    },
  },
});

export const TestHeader = () => {
  const router = useRouter();
  const { config, callState, leave, numParticipants } = useTest();
  const [clock, setClock] = useState('--:--');
  const [started, setStarted] = useState();
  const beatRef = useRef();

  useEffect(() => {
    if (
      started ||
      beatRef.current ||
      !router.isReady ||
      router.query?.['robot']
    ) {
      return;
    }

    if (callState === 'joined') {
      setStarted(moment());
    }
  }, [started, callState, router.isReady, router.query]);

  useEffect(() => {
    if (!started) {
      return;
    }

    beatRef.current = setInterval(() => {
      const endTime = moment(started).add(config.durationInSecs, 'seconds');
      const now = moment();
      const delta = moment.duration(endTime.diff(now));
      const tick = moment.utc(delta.asMilliseconds());

      if (delta.asSeconds() <= 0) {
        clearInterval(beatRef.current);
        setStarted(false);
        setClock('00:00');

        if (config.leaveOnElapsed) {
          leave();
        }
      } else {
        setClock(tick.format('mm:ss'));
      }
    }, 1000);

    return () => clearInterval(beatRef.current);
  }, [started, config.durationInSecs, config.leaveOnElapsed, leave]);

  return (
    <StyledHeader>
      <StyledCardHolder
        style={{ flex: 1, display: 'flex', justifyContent: 'start' }}
      >
        <StyledHeaderCard className="strong">
          {PROVIDER_MAPPING[config.provider]}
        </StyledHeaderCard>
      </StyledCardHolder>
      <StyledCardHolder>
        <StyledHeaderCard>
          <PersonIcon />
          {numParticipants}
        </StyledHeaderCard>
        <StyledHeaderCard className={clock === '00:00' ? 'done' : 'counting'}>
          <TimerIcon />
          <span style={{ width: '50px', textAlign: 'center' }}>{clock}</span>
        </StyledHeaderCard>
      </StyledCardHolder>
      <StyledCardHolder css={{ flex: 1, justifyContent: 'end' }}>
        <StyleCallState>
          <span>State: </span>
          {callState}
        </StyleCallState>
        <Button onClick={() => leave()} color="warning">
          Exit Test
        </Button>
      </StyledCardHolder>
    </StyledHeader>
  );
};

export default React.memo(TestHeader, () => true);
