import React, { useEffect, useState } from 'react';
import {
  EyeOpenIcon,
  CheckCircledIcon,
  CrossCircledIcon,
} from '@radix-ui/react-icons';
import { useUser } from '@supabase/auth-helpers-react';
import Button from 'components/ui/Button';
import Card from 'components/ui/Card';
import {
  HoverCardContent,
  HoverCardTrigger,
  HoverCard,
} from 'components/ui/HoverCard';
import { Loader } from 'components/ui/Loader';
import Tag from 'components/ui/Tag';
import Link from 'next/link';
import { styled } from 'styles/stitches.config';
import { PROVIDER_MAPPING } from 'utils/constants';

const StyledGrid = styled('div', {
  fontSize: '$2',
  border: '1px solid $slate6',
  br: '$default',
  overflow: 'hidden',

  '.row, & > header': {
    display: 'grid',
    gridTemplateColumns: '40px 80px 270px 40px 140px auto',
    padding: '$2 $2 $2 $3',
    alignItems: 'center',
    borderBottom: '1px solid $slate6',
  },

  '& > header': {
    color: '$slate12',
    fontWeight: '$medium',
    py: '$4',
    lineHeight: 1,
    backgroundColor: '$slate3',
  },

  '.row:last-child': {
    borderBottom: '0px',
  },

  '.row:nth-child(even)': {
    background: '$slate1',
  },

  '.row > .fit': {
    display: 'flex',
  },
});

const StyledIconBubble = styled('div', {
  background: '$slate4',
  color: '$slate11',
  lineHeight: 1,
  width: '21px',
  height: '21px',
  borderRadius: '21px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const LoadTest = () => {
  const [fetching, setFetching] = useState(false);
  const [tests, setTests] = useState([]);

  const user = useUser();

  useEffect(() => {
    if (!user?.id) return;

    setFetching(true);

    const getTests = async () => {
      const res = await fetch('/api/load?user_id=' + user.id);
      const { data } = await res.json();
      setTimeout(() => {
        setTests(data);
        setFetching(false);
      }, 500);
    };

    getTests().catch(console.error);
  }, [user?.id]);

  return (
    <Card css={{ minWidth: 720, rowGap: '$5' }}>
      <h2>Load Test</h2>
      {fetching ? (
        <Loader />
      ) : !tests || tests?.length === 0 ? (
        <p>Can&apos;t find any tests start by creating one</p>
      ) : (
        <StyledGrid>
          <header>
            <div>ID</div>
            <div>Provider</div>
            <div>UUID</div>
            <div>ILS</div>
            <div style={{ textAlign: 'center' }}>Config</div>
            <div />
          </header>
          {tests.map((test, index) => (
            <div key={`test-${index}`} className="row">
              <div>{test.id}</div>
              <div>{PROVIDER_MAPPING[test.provider]}</div>
              <div className="fit">
                <Tag>{test.uuid}</Tag>
              </div>
              <div className="fit">
                {test.config.ils ? (
                  <CheckCircledIcon color="green" />
                ) : (
                  <CrossCircledIcon color="red" />
                )}
              </div>
              <div className="fit" style={{ justifyContent: 'center' }}>
                <HoverCard openDelay={0}>
                  <HoverCardTrigger asChild>
                    <StyledIconBubble>
                      <EyeOpenIcon />
                    </StyledIconBubble>
                  </HoverCardTrigger>
                  <HoverCardContent
                    side="top"
                    sideOffset={4}
                    css={{
                      'pointer-events': 'none',
                      fontSize: '$2',
                      lineHeight: '$tight',
                    }}
                  >
                    <pre>{JSON.stringify(test.config, null, 2)}</pre>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <div className="fit" style={{ justifyContent: 'end' }}>
                <Link href={`/${test.uuid}`}>
                  <Button size="small">Load</Button>
                </Link>
              </div>
            </div>
          ))}
        </StyledGrid>
      )}
    </Card>
  );
};

export default LoadTest;
