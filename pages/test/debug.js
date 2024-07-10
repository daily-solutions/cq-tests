import { useCallback, useEffect, useState } from 'react';
import Daily from '@daily-co/daily-js';
import { withPageAuth } from '@supabase/auth-helpers-nextjs';
import { Layout } from 'components/Layout';
import { Button } from 'components/ui/Button';
import { Container } from 'components/ui/Container';
import uuid4 from 'uuid4';

const CLIENT_ID = uuid4();

export default function Load() {
  const [callObject, setCallObject] = useState();
  const [robotState, setRobotState] = useState('STATE_INIT');
  const [robotId, setRobotId] = useState();
  const [callState, setCallState] = useState('STATE_INIT');

  const DAILY_ROOM = `https://jpt.staging.daily.co/debug`;
  const DAILY_KEY = process.env.NEXT_PUBLIC_PROVIDER_DAILY_KEY;

  useEffect(() => {
    window.statsConfig = {
      uuid: CLIENT_ID,
    };
  }, []);

  /**
   * CALL LOOP
   */
  const createDebugCall = () => {
    if (callObject) {
      return;
    }

    const co = Daily.createCallObject({
      url: DAILY_ROOM, // public room
      audioSource: false,
      //videoSource: deviceId,
      dailyConfig: {
        experimentalChromeVideoMuteLightOff: true,
        // ...
      },
    });

    setCallObject(co);

    co.on('joining-meeting', () => setCallState('STATE_JOINING'));
    co.on('joined-meeting', () => setCallState('STATE_JOINED'));
    co.on('left-meeting', () => setCallState('STATE_LEFT'));
    co.on('error', (e) => console.log(e));
    //this.callObject.on('participant-joined', () => this.participants());
    //this.callObject.on('participant-updated', () => this.participants());
    //this.callObject.on('participant-left', () => this.participants());

    co.join();
  };

  const leaveAndDestroy = useCallback(async () => {
    if (!callObject) {
      return;
    }

    await callObject.leave();
    callObject.destroy();
  }, [callObject]);

  useEffect(() => () => leaveAndDestroy(), [leaveAndDestroy]);

  /**
   * ROBOS
   */
  const launchRobot = async () => {
    setRobotState('STATE_CREATING');

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_KEY}`,
      },
      body: JSON.stringify({
        url: DAILY_ROOM,
        count_per_region: 1,
        regions: ['eu-west-2'],
        duration_mins: 1,
      }),
    };
    const res = await fetch('https://api.staging.daily.co/v1/robots', options);

    const { id } = await res.json();

    setRobotId(id);
    setRobotState('STATE_CREATED');
  };

  const getRobots = async () => {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_KEY}`,
      },
    };
    const res = await fetch('https://api.staging.daily.co/v1/robots', options);
    const resp = await res.json();

    console.log(resp);

    // Loop through and destroy all robots
    resp.robots?.forEach((r) => r.status !== 'stopped' && destroyRobot(r.id));
  };

  const destroyRobot = useCallback(
    async (id) => {
      const options = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DAILY_KEY}`,
        },
      };
      const res = await fetch(
        `https://api.staging.daily.co/v1/robots/${id}`,
        options
      );

      setRobotId(null);
      setRobotState('STATE_DELETED');
    },
    [DAILY_KEY]
  );

  useEffect(() => {
    return () => {
      if (robotId) {
        destroyRobot(robotId);
      }
    };
  }, [robotId, destroyRobot]);

  /**
   * DATA
   */

  const getStatsBatch = () => {
    console.log(window.statsBatch);
  };

  const writeStatsBatch = async () => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        test_id: 1,
      }),
    };
    const res = await fetch(`/api/stats`, options);
  };

  /**
   * RENDER
   */
  const render = () => {
    switch (callState) {
      case 'STATE_INIT': {
        return (
          <Button onClick={() => createDebugCall()}>
            Join test Daily call
          </Button>
        );
      }
      case 'STATE_JOINING': {
        return <div>Joining...</div>;
      }
      case 'STATE_JOINED': {
        return (
          <Button onClick={() => leaveAndDestroy()}>Leave & Destroy</Button>
        );
      }
      default:
        return;
    }
  };

  return (
    <Layout>
      <Container>
        {render()}
        <hr />
        <Button onClick={() => new RTCPeerConnection()}>
          Manually create PeerConnection
        </Button>
        <hr />
        {robotState !== 'STATE_CREATED' ? (
          <Button onClick={() => launchRobot()}>Launch robot</Button>
        ) : (
          <Button onClick={() => destroyRobot(robotId)}>Destroy robot</Button>
        )}

        {robotId && <div>Robot ID: {robotId}</div>}
        <hr />
        <Button onClick={() => getRobots()}>Get all robots</Button>
        <hr />
        <Button onClick={() => getStatsBatch()}>Read stats batch</Button>
        <hr />
        <Button onClick={() => writeStatsBatch()}>
          Write batch to database
        </Button>
      </Container>
    </Layout>
  );
}

export const getServerSideProps = withPageAuth({
  redirectTo: '/login?path=/load',
});
