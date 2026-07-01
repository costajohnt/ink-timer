import { useEffect, useRef } from 'react';

const MIN_INTERVAL_MS = 16;

/**
 * A self-scheduling interval hook that:
 * 1. Uses a ref for the callback to avoid stale closures.
 * 2. Accepts `null` delay to pause.
 * 3. Cleans up on unmount or when the delay source changes.
 * 4. Supports a dynamic delay function so each tick can be scheduled to the
 *    next boundary (or a deadline) instead of a fixed cadence.
 *
 * Instead of `setInterval`, each tick is scheduled with `setTimeout` and the
 * next delay is recomputed after every fire. This keeps ticks aligned to the
 * caller's timestamp anchors (no drift, no skipped/repeated display values).
 *
 * The `delay` argument may be:
 * - `null`  — paused, nothing is scheduled.
 * - a number — fixed delay in ms.
 * - a function returning `number | null` — recomputed after each tick; return
 *   `null` to stop. Pass a stable (memoized) function identity: the hook
 *   re-subscribes whenever `delay` changes, so an inline closure would reset
 *   the schedule on every render.
 *
 * This hook does NOT track time itself. The callback is responsible for
 * computing elapsed time from Date.now() anchors.
 */
export function useInterval(
  callback: () => void,
  delay: number | (() => number | null) | null,
): void {
  const savedCallback = useRef(callback);
  const savedDelay = useRef(delay);

  // Update refs to the latest callback/delay on every render.
  useEffect(() => {
    savedCallback.current = callback;
  });
  useEffect(() => {
    savedDelay.current = delay;
  });

  useEffect(() => {
    if (delay === null) {
      return;
    }

    let stopped = false;
    let id: ReturnType<typeof setTimeout> | undefined;

    const loop = () => {
      const current = savedDelay.current;
      const value = typeof current === 'function' ? current() : current;
      if (value === null) {
        return;
      }

      id = setTimeout(() => {
        if (stopped) {
          return;
        }
        savedCallback.current();
        loop();
      }, Math.max(0, value));
    };

    loop();

    return () => {
      stopped = true;
      if (id !== undefined) {
        clearTimeout(id);
      }
    };
    // `delay` identity is the re-subscribe signal: a changed number, a toggle
    // to/from null, or a new memoized function (e.g. an interval change).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay]);
}

/**
 * Validate and clamp an update interval, warning once per hook instance in
 * dev mode when the interval is non-positive. The warning flag lives in a ref
 * so two hook instances never share (or swallow) each other's warnings.
 */
export function useClampedInterval(interval: number): number {
  const warned = useRef(false);

  if (interval <= 0) {
    if (process.env['NODE_ENV'] !== 'production' && !warned.current) {
      warned.current = true;
      console.warn(
        `[ink-timer] Received interval=${interval}. ` +
        `Clamping to ${MIN_INTERVAL_MS}ms minimum.`,
      );
    }
    return MIN_INTERVAL_MS;
  }

  return interval;
}
