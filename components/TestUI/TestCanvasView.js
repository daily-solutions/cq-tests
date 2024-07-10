import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTest } from 'contexts/TestProvider';
import { useVideoGrid } from 'hooks/useVideoGrid';
import { styled } from 'styles/stitches.config';
import { useDeepCompareMemo } from 'use-deep-compare';
import { useCanvasDimension } from '../../hooks/useCanvasDimension';
import { useCanvasGrid } from '../../hooks/useCanvasGrid';
import { useResizeObserver } from '../../hooks/useResizeObserver';

const StyledGridContainer = styled('div', {
  height: '100%',
  width: '100%',
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

const TestCanvasView = () => {
  const gridRef = useRef(null);
  const canvasRef = useRef(null);
  const { participants, provider, callState, isVideoDecodeReady } = useTest();

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

  const stream = useDeepCompareMemo(
    () => provider.client.getMediaStream(),
    [provider]
  );

  const canvasDimension = useCanvasDimension(stream, canvasRef);
  useCanvasGrid(canvasRef, canvasDimension, isVideoDecodeReady, participants);

  return (
    <StyledGridContainer ref={gridRef}>
      <StyledTilesContainer>
        <canvas
          ref={canvasRef}
          id="participants-canvas"
          style={{ width: containerWidth, height: containerHeight }}
        />
      </StyledTilesContainer>
    </StyledGridContainer>
  );
};

export default TestCanvasView;
