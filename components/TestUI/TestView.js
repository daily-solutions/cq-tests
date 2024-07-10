import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useTest } from '../../contexts/TestProvider';
import { useResizeObserver } from '../../hooks/useResizeObserver';
import { useVideoGrid } from '../../hooks/useVideoGrid';
import { styled } from '../../styles/stitches.config';
import BlueJeansTile from '../Video/BlueJeansTile';
import ChimeTile from '../Video/ChimeTile';
import DolbyTile from '../Video/DolbyTile';
import HMSTile from '../Video/HMSTile';
import Tile from '../Video/Tile';
import TwilioTile from '../Video/TwilioTile';

const StyledGridContainer = styled('div', {
  height: '100dvh',
  width: '100dvw',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const StyledTilesContainer = styled('div', {
  display: 'flex',
  flexFlow: 'row wrap',
  alignItems: 'center',
  justifyContent: 'center',
  margin: 'auto',
  width: '100%',
  gap: 'var(--grid-gap, 1px)',
  maxHeight: 'var(--grid-height, 100%)',
  maxWidth: 'var(--grid-width, 100%)',
  overflow: 'hidden',
  transition: 'height 100ms ease, width 100ms ease',
});

const TestView = () => {
  const gridRef = useRef(null);
  const { participants, config } = useTest();

  const [dimensions, setDimensions] = useState({
    width: 1,
    height: 1,
  });

  useResizeObserver(
    gridRef,
    useCallback(() => {
      if (!gridRef.current) return;
      const { height, width } = gridRef.current.getBoundingClientRect();
      setDimensions({ height, width });
    }, [])
  );

  const { columns, containerHeight, containerWidth } = useVideoGrid({
    width: dimensions.width,
    height: dimensions.height,
    minTileWidth: 280,
    gap: 1,
    sessionIds: participants,
  });

  useEffect(() => {
    if (!gridRef.current) return;
    gridRef.current.style.setProperty('--grid-gap', '1px');
    gridRef.current.style.setProperty('--grid-columns', columns.toString());
    gridRef.current.style.setProperty('--grid-width', `${containerWidth}px`);
    gridRef.current.style.setProperty('--grid-height', `${containerHeight}px`);
  }, [columns, containerHeight, containerWidth]);

  const TileUI = useMemo(() => {
    return config.provider === '100ms'
      ? HMSTile
      : config.provider === 'twilio' || config.provider === 'livekit'
      ? TwilioTile
      : config.provider === 'chime'
      ? ChimeTile
      : config.provider === 'bluejeans'
      ? BlueJeansTile
      : config.provider === 'dolby'
      ? DolbyTile
      : Tile;
  }, [config.provider]);

  return (
    <StyledGridContainer ref={gridRef}>
      <StyledTilesContainer>
        {participants.map((participantTrack, index) => (
          <TileUI key={index} track={participantTrack} />
        ))}
      </StyledTilesContainer>
    </StyledGridContainer>
  );
};

export default TestView;
