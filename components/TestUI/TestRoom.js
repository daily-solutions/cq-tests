import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTest } from 'contexts/TestProvider';
import moment from 'moment';
import dynamic from 'next/dynamic';
import TestView from './TestView';

const TestCanvasView = dynamic(() => import('./TestCanvasView'), {
  ssr: false,
});

export const TestRoom = () => {
  const { callState, destroy, config, joinCall, leave } = useTest();
  const [started, setStarted] = useState();
  const beatRef = useRef();

  useEffect(() => {
    if (started || beatRef.current || callState !== 'joined') {
      return;
    }

    setStarted(moment());
  }, [started, callState]);

  useEffect(() => {
    if (!started) {
      return;
    }

    beatRef.current = setInterval(() => {
      const endTime = moment(started).add(config.durationInSecs, 'seconds');
      const now = moment();
      const delta = moment.duration(endTime.diff(now));

      if (delta.asSeconds() <= 0) {
        clearInterval(beatRef.current);
        setStarted(false);

        if (config.leaveOnElapsed) leave();
      }
    }, 1000);

    return () => clearInterval(beatRef.current);
  }, [started, config.durationInSecs, config.leaveOnElapsed, leave]);

  const callUI = useMemo(() => {
    switch (callState) {
      case 'joining':
        return <div />;
      case 'joined':
        return config.provider === 'zoom' ? <TestCanvasView /> : <TestView />;
      case 'left':
        return <div />;
    }
  }, [callState, config.provider]);

  useEffect(() => {
    joinCall();
    return () => {
      destroy();
    };
  }, [destroy, joinCall]);

  return callUI;
};

export default React.memo(TestRoom, () => true);
