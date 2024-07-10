import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useTest } from '../../contexts/TestProvider';
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

const BlueJeansTile = ({ track }) => {
  const { provider } = useTest();
  const tileRef = useRef(null);
  const videoRef = useRef(null);
  const [tileAspectRatio] = useState(16 / 9);
  const [resolution, setResolution] = useState(null);
  const memoizedResolution = useMemo(() => resolution, [resolution]);

  useEffect(() => {
    const checkIfAttached =
      provider.sdk.meetingService?.videoStreamService?.attachedViewsForParticipantIds.has(
        track.participantGuid
      );

    if (!checkIfAttached) {
      const video = videoRef.current;
      provider.sdk.meetingService.videoStreamService.attachParticipantToView(
        track.participantGuid,
        video
      );
    }
  }, [
    provider.sdk,
    track.participantGuid,
    track.isVideoMuted,
    provider.sdk.meetingService?.videoStreamService?.videoStreams,
  ]);

  useEffect(() => {
    return () => {
      provider.sdk.meetingService.videoStreamService.detachParticipantFromView(
        track.participantGuid
      );
    };
  }, [provider.sdk, track.participantGuid]);

  useEffect(() => {
    const video = videoRef.current;

    const interval = setInterval(() => {
      const videoElement = video.getElementsByTagName('video')[0];
      if (!videoElement?.srcObject) return;

      const track = videoElement.srcObject.getVideoTracks()[0];
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
        <div
          id={track.participantGuid}
          ref={videoRef}
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

export default BlueJeansTile;
