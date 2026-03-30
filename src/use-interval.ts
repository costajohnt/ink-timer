import { useEffect, useRef } from 'react';

/**
 * A useInterval hook that:
 * 1. Uses a ref for the callback to avoid stale closures
 * 2. Accepts `null` delay to pause the interval
 * 3. Cleans up on unmount or delay change
 *
 * This hook does NOT track time itself. The callback is responsible
 * for computing elapsed time from Date.now() anchors.
 */
export function useInterval(
  callback: () => void,
  delay: number | null,
): void {
  const savedCallback = useRef(callback);

  // Update ref to latest callback on every render.
  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    if (delay === null) {
      return;
    }

    const id = setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => clearInterval(id);
  }, [delay]);
}
