import React from 'react';
import { Card } from 'components/ui/Card';
import { Flex } from 'components/ui/Flex';

export const TestWaitingRoom = ({ count }) => {
  return (
    <Flex
      css={{
        width: '100dvw',
        height: '100dvh',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card css={{ width: 560, rowGap: '$5' }}>
        <h3>Waiting for others to join</h3>
        <p>
          {count} {count === 1 ? 'participant is' : 'participants are'} needed
          to start this test
        </p>
      </Card>
    </Flex>
  );
};
