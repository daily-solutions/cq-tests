import React from 'react';
import { useEffect, useCallback, useState } from 'react';
import Flex from 'components/ui/Flex';
import Select from 'components/ui/Select';

export const DeviceList = ({ onDeviceChange }) => {
  const [devices, setDevices] = useState([]);

  const enumerateDevices = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true,
    });
    stream.getTracks().forEach((track) => track.stop());
    const d = await navigator.mediaDevices.enumerateDevices();
    const cameras = d.filter((c) => c.kind === 'videoinput');

    onDeviceChange(cameras[0].deviceId);

    setDevices(cameras);
  }, [onDeviceChange]);

  useEffect(() => {
    enumerateDevices();
  }, [enumerateDevices]);

  return (
    <Flex css={{ flexFlow: 'column wrap', rowGap: '$3' }}>
      <label htmlFor="deviceId">Select camera device</label>
      <Select id="deviceId" onChange={(e) => onDeviceChange(e.target.value)}>
        {!devices.length ? (
          <option value="">Loading devices...</option>
        ) : (
          devices.map((cam) => (
            <option key={cam.deviceId} value={cam.deviceId}>
              {cam.label}
            </option>
          ))
        )}
      </Select>
    </Flex>
  );
};

export default React.memo(DeviceList, () => true);
