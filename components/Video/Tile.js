import React, { useEffect, useMemo, useRef, useState } from 'react';
import DailyVideo from './DailyVideo';
import { styled } from '../../styles/stitches.config';

const StyledTile = styled('div', {
  position: 'relative',
  width: '100%',
  minWidth: 1,
  overflow: 'hidden',
  backgroundColor: '$slate2',
});
const StyledTileContent = styled('div', {});
const StyledResolution = styled('div', {
  position: 'absolute',
  right: 0,
  top: 0,
  zIndex: 1,
  color: 'black',
  padding: '$2',
});

const Tile = ({ track }) => {
  const [tileAspectRatio] = useState(16 / 9);
  const tileRef = useRef(null);
  const [resolution, setResolution] = useState(null);
  const memoizedResolution = useMemo(() => resolution, [resolution]);

  useEffect(() => {
    const interval = setInterval(() => {
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
  }, [track, track?.id]);

  return (
    <StyledTile
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
        <DailyVideo
          track={track}
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
    </StyledTile>
  );
};

export default Tile;
