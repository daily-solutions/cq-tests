import { useRef, useEffect } from 'react';

export const usePrevious = (props) => {
  const ref = useRef(null);

  useEffect(() => {
    ref.current = props;
  }, [props]);

  return ref.current;
};
