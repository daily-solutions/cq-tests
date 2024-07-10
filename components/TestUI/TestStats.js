import React, { useEffect, useState } from 'react';

export const TestStats = () => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (connected) {
      return;
    }

    const i = setInterval(() => {
      console.log(window.rtcpeers);
    }, 2000);

    return () => clearInterval(i);
  }, [connected]);

  return null;
};

export default React.memo(TestStats, () => true);
