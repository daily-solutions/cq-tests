import { useState, useCallback, useEffect } from 'react';
import _ from 'lodash';
import { useResizeObserver } from './useResizeObserver';

export function useMount(fn) {
  useEffect(() => {
    fn();
  }, []);
}

export const useCanvasDimension = (mediaStream, canvasRef) => {
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  const onCanvasResize = useCallback(
    (width, height) => {
      if (canvasRef) {
        _.debounce((...args) => {
          setDimension({
            width: args[0],
            height: args[1],
          });
        }, 300).call(null, width, height);
      }
    },
    [canvasRef]
  );
  useResizeObserver(canvasRef, onCanvasResize);

  useMount(() => {
    if (canvasRef.current) {
      const { width, height } = canvasRef.current.getBoundingClientRect();
      setDimension({ width, height });
    }
  });

  useEffect(() => {
    const { width, height } = dimension;
    try {
      if (canvasRef.current) {
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    } catch (e) {
      mediaStream?.updateVideoCanvasDimension(canvasRef.current, width, height);
    }
  }, [mediaStream, dimension, canvasRef]);
  return dimension;
};
