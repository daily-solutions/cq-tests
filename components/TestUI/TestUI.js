import React, { useEffect, useState, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import TestRoom from './TestRoom';
import { TestWaitingRoom } from './TestWaitingRoom';
import { useTest } from '../../contexts/TestProvider';

export const TestUI = () => {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const [inWaitingRoom, setInWaitingRoom] = useState(true);
  const { config } = useTest();
  const [count, setCount] = useState(0);

  const updateTest = useCallback(
    async (uuid, config) =>
      await supabaseClient.from('joined').insert({ uuid, config }),
    [supabaseClient]
  );

  useEffect(() => {
    if (!supabaseClient || !config.testId) return;

    const channel = supabaseClient.channel(config.testId);
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setCount(count);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
          });
        }
      });
  }, [supabaseClient, config?.testId]);

  useEffect(() => {
    if (!inWaitingRoom) return;

    const requiredCount = config?.totalCount ?? 2;
    if (count >= requiredCount) {
      setInWaitingRoom(false);
      updateTest(router.query.uuid, config);
    }
  }, [count, router.query, supabaseClient, updateTest, config, inWaitingRoom]);

  return inWaitingRoom ? (
    <TestWaitingRoom count={Math.abs((config?.totalCount ?? 2) - count)} />
  ) : (
    <TestRoom />
  );
};

export default React.memo(TestUI, () => true);
