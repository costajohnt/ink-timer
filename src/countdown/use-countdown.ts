import { useState, useCallback, useRef, useEffect } from 'react';
import { useInterval } from '../use-interval.js';
import { formatTime } from '../format.js';
import type { UseCountdownOptions, UseCountdownResult } from '../types.js';

let warnedDurationOnce = false;

export function useCountdown(options: UseCountdownOptions): UseCountdownResult {
  const {
    duration,
    autoStart = true,
    interval = 1000,
    onTick,
    onComplete,
    format,
  } = options;

  // Validate duration at dev time
  if (duration <= 0) {
    if (process.env['NODE_ENV'] !== 'production' && !warnedDurationOnce) {
      warnedDurationOnce = true;
      console.warn(
        `[ink-timer] useCountdown received duration=${duration}. ` +
        'Duration must be > 0. The countdown will be immediately complete.',
      );
    }
  }

  const safeDuration = Math.max(0, duration);

  const [isRunning, setIsRunning] = useState(autoStart && safeDuration > 0);
  const [isComplete, setIsComplete] = useState(safeDuration <= 0);
  const [elapsedMs, setElapsedMs] = useState(0);

  const startedAtRef = useRef<number | null>(
    autoStart && safeDuration > 0 ? Date.now() : null,
  );
  const accumulatedMsRef = useRef(0);
  const isRunningRef = useRef(autoStart && safeDuration > 0);
  const onTickRef = useRef(onTick);
  const onCompleteRef = useRef(onComplete);
  const completeFiredRef = useRef(safeDuration <= 0);
  const durationRef = useRef(safeDuration);

  useEffect(() => { onTickRef.current = onTick; });
  useEffect(() => { onCompleteRef.current = onComplete; });

  // Handle dynamic duration changes: reset the countdown with new duration
  useEffect(() => {
    const newSafeDuration = Math.max(0, duration);
    if (newSafeDuration === durationRef.current) return;

    durationRef.current = newSafeDuration;
    accumulatedMsRef.current = 0;
    startedAtRef.current = null;
    completeFiredRef.current = newSafeDuration <= 0;
    isRunningRef.current = false;
    setElapsedMs(0);
    setIsRunning(false);
    setIsComplete(newSafeDuration <= 0);
  }, [duration]);

  const tick = useCallback(() => {
    if (startedAtRef.current === null) return;

    const now = Date.now();
    const totalElapsed = accumulatedMsRef.current + (now - startedAtRef.current);
    const remaining = Math.max(0, durationRef.current - totalElapsed);

    setElapsedMs(totalElapsed);
    onTickRef.current?.(remaining);

    if (remaining <= 0 && !completeFiredRef.current) {
      completeFiredRef.current = true;
      accumulatedMsRef.current = durationRef.current;
      startedAtRef.current = null;
      isRunningRef.current = false;
      setIsRunning(false);
      setIsComplete(true);
      onCompleteRef.current?.();
    }
  }, []);

  useInterval(tick, isRunning ? interval : null);

  const remainingMs = Math.max(0, safeDuration - elapsedMs);

  const start = useCallback(() => {
    if (completeFiredRef.current) return;
    if (isRunningRef.current) return;
    startedAtRef.current = Date.now();
    isRunningRef.current = true;
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    if (!isRunningRef.current) return;
    if (startedAtRef.current !== null) {
      accumulatedMsRef.current += Date.now() - startedAtRef.current;
      startedAtRef.current = null;
    }
    isRunningRef.current = false;
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    accumulatedMsRef.current = 0;
    startedAtRef.current = null;
    completeFiredRef.current = false;
    isRunningRef.current = false;
    setElapsedMs(0);
    setIsRunning(false);
    setIsComplete(false);
  }, []);

  const toggle = useCallback(() => {
    if (isRunningRef.current) {
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  const restart = useCallback(() => {
    reset();
    // Schedule start after reset state flushes — use a microtask to allow
    // React to process the reset state updates first.
    startedAtRef.current = Date.now();
    isRunningRef.current = true;
    setIsRunning(true);
  }, [reset]);

  const formatted = formatTime(remainingMs, format);

  return {
    remainingMs,
    isRunning,
    isComplete,
    formatted,
    start,
    stop,
    reset,
    toggle,
    restart,
  };
}

/**
 * Reset the one-time duration warning flag. Exposed for testing only.
 * @internal
 */
export function _resetCountdownWarning(): void {
  warnedDurationOnce = false;
}
