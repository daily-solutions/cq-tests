import React, { useEffect, useRef, useState, useMemo } from 'react';
import { styled } from '../../styles/stitches.config';

const StyledTileContent = styled('div', {});
const StyledResolution = styled('div', {
  position: 'absolute',
  right: 0,
  top: 0,
  zIndex: 1,
  color: 'black',
  padding: '$2',
});

const ChimeTile = ({ track }) => {
  const tileRef = useRef(null);
  const videoRef = useRef(null);
  const [tileAspectRatio] = useState(16 / 9);
  const [resolution, setResolution] = useState(null);
  const memoizedResolution = useMemo(() => resolution, [resolution]);

  useEffect(() => {
    const video = videoRef.current;
    track.bindVideoElement(video);

    return () => {
      track.bindVideoElement(null);
    };
  }, [track]);

  useEffect(() => {
    const video = videoRef.current;

    const interval = setInterval(() => {
      if (!video.srcObject) return;

      const track = video.srcObject.getVideoTracks()[0];
      const settings = track?.getSettings();
      setResolution(
        settings?.width && settings?.height
          ? `${settings?.width}x${settings?.height}`
          : null
      );
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      ref={tileRef}
      style={{
        position: 'relative',
        width: '100%',
        minWidth: 1,
        overflow: 'hidden',
        backgroundColor: '$slate2',
        maxWidth: 'calc(100% / var(--grid-columns, 1) - var(--grid-gap)',
      }}
    >
      <StyledTileContent css={{ paddingBottom: `${100 / tileAspectRatio}%` }}>
        <StyledResolution>{memoizedResolution}</StyledResolution>
        <video
          ref={videoRef}
          id={crypto.randomUUID()}
          autoPlay
          muted
          playsInline
          style={{
            height: 'calc(100% + 4px)',
            width: 'calc(100% + 4px)',
            position: 'absolute',
            top: -2,
            left: -2,
            objectPosition: 'center',
          }}
        />
      </StyledTileContent>
    </div>
  );
};

export default ChimeTile;
