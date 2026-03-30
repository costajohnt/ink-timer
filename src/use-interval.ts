import { useEffect, useRef } from 'react';

const MIN_INTERVAL_MS = 16;

let warnedIntervalOnce = false;

/**
 * A useInterval hook that:
 * 1. Uses a ref for the callback to avoid stale closures
 * 2. Accepts `null` delay to pause the interval
 * 3. Cleans up on unmount or delay change
 * 4. Guards against invalid delay values (<= 0) by clamping to 16ms minimum
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

    let safeDelay = delay;
    if (delay <= 0) {
      if (process.env['NODE_ENV'] !== 'production' && !warnedIntervalOnce) {
        warnedIntervalOnce = true;
        console.warn(
          `[ink-timer] useInterval received delay=${delay}. ` +
          `Clamping to ${MIN_INTERVAL_MS}ms minimum.`,
        );
      }
      safeDelay = MIN_INTERVAL_MS;
    }

    const id = setInterval(() => {
      savedCallback.current();
    }, safeDelay);

    return () => clearInterval(id);
  }, [delay]);
}

/**
 * Reset the one-time warning flag. Exposed for testing only.
 * @internal
 */
export function _resetIntervalWarning(): void {
  warnedIntervalOnce = false;
}
