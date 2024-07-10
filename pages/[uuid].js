import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import DeviceList from 'components/DeviceList/DeviceList';
import TestUI from 'components/TestUI/TestUI';
import Button from 'components/ui/Button';
import Card from 'components/ui/Card';
import Container from 'components/ui/Container';
import { Divider } from 'components/ui/Divider';
import { Flex } from 'components/ui/Flex';
import { Switch, SwitchThumb } from 'components/ui/Switch';
import { TestProvider } from 'contexts/TestProvider';
import { useRouter } from 'next/router';
import { styled } from 'styles/stitches.config';
import { supabase } from 'utils/supabaseClient';

const StyledConfig = styled('pre', {
  lineHeight: '$tight',
  fontSize: '$2',
  br: '$default',
  border: '1px solid $slate6',
  backgroundColor: '$slate1',
  padding: '$3',
  margin: 0,
  width: '100%',
  overflow: 'scroll',
});

export default function UUID({ config, enableHairCheck, role, region }) {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const [haircheck, setHaircheck] = useState(enableHairCheck);
  const [deviceId, setDeviceId] = useState();
  const [count, setCount] = useState(0);
  const [isHost, setIsHost] = useState(role === 'host');

  useEffect(() => {
    if (haircheck) return;

    console.info('Adding rtcstats script to page', config);

    const script = document.createElement('script');
    script.dataset.key = config.key;
    script.dataset.url = config.url;
    script.dataset.clientid = crypto.randomUUID();
    script.dataset.testid = config.testId;
    script.dataset.region = region;
    script.src = '/stats.js';
    script.async = true;
    document.body.appendChild(script);

    return () => document.body.removeChild(script);
  }, [config, haircheck, region]);

  useEffect(() => {
    if (!supabaseClient || !config.testId || !haircheck) return;
    const channel = supabaseClient.channel(config.testId);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setCount(count);
      })
      .subscribe();
  }, [haircheck, supabaseClient, config?.testId]);

  if (haircheck) {
    return (
      <Container css={{ rowGap: '$5' }}>
        <Card css={{ width: 560, rowGap: '$5' }}>
          <h2>Participants in room: {count}</h2>
          <StyledConfig>{JSON.stringify(config, null, 2)}</StyledConfig>
          <Divider />
          {config.ils && (
            <Flex
              css={{ alignItems: 'center', justifyContent: 'space-between' }}
            >
              <label>Join as host</label>
              <Switch
                name="role"
                checked={isHost}
                onCheckedChange={(c) => setIsHost(c)}
              >
                <SwitchThumb />
              </Switch>
            </Flex>
          )}
          <DeviceList
            onDeviceChange={(newDeviceId) => setDeviceId(newDeviceId)}
          />
          <Button id="join" onClick={() => setHaircheck(false)}>
            Join
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <TestProvider
      providerConfig={config}
      deviceId={deviceId}
      onConclude={() => router.push(`/results`)}
      isHost={isHost}
    >
      <TestUI />
    </TestProvider>
  );
}

export async function getServerSideProps(context) {
  const { uuid } = context.params;
  const { role, robot, region } = context.query;

  const { data } = await supabase
    .from('Tests')
    .select()
    .eq('uuid', uuid)
    .single();

  if (!data?.config) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      config: {
        ...data.config,
        // if the field doesn't exist then we set it to true
        // to support prev tests when the field didn't exist.
        enableSimulcast: data.config?.enableSimulcast ?? true,
        testId: data.id,
        key: process.env.RTCSTATS_FUNCTIONS_KEY,
        url: process.env.RTCSTATS_FUNCTIONS_URL,
      },
      enableHairCheck: !robot,
      role: role ?? 'audience',
      region: region ?? '',
    },
  };
}
