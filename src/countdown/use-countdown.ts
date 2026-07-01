import { useState, useCallback, useRef, useEffect } from 'react';
import { useInterval, useClampedInterval } from '../use-interval.js';
import { formatTime, type WarnOnce } from '../format.js';
import type { UseCountdownOptions, UseCountdownResult } from '../types.js';

export function useCountdown(options: UseCountdownOptions): UseCountdownResult {
  const {
    duration,
    autoStart = true,
    interval = 1000,
    onTick,
    onComplete,
    format,
  } = options;

  const safeInterval = useClampedInterval(interval);
  const warnedDurationRef = useRef(false);
  const formatWarnRef = useRef<WarnOnce>({ warned: false });

  // Validate duration at dev time (once per hook instance).
  if (duration <= 0) {
    if (process.env['NODE_ENV'] !== 'production' && !warnedDurationRef.current) {
      warnedDurationRef.current = true;
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

  // Handle dynamic duration changes: reset the countdown with the new
  // duration, honoring autoStart (restart from the new duration when true,
  // otherwise reset to a stopped state).
  useEffect(() => {
    const newSafeDuration = Math.max(0, duration);
    if (newSafeDuration === durationRef.current) return;

    const shouldRun = autoStart && newSafeDuration > 0;
    durationRef.current = newSafeDuration;
    accumulatedMsRef.current = 0;
    startedAtRef.current = shouldRun ? Date.now() : null;
    completeFiredRef.current = newSafeDuration <= 0;
    isRunningRef.current = shouldRun;
    setElapsedMs(0);
    setIsRunning(shouldRun);
    setIsComplete(newSafeDuration <= 0);
  }, [duration, autoStart]);

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

  // Schedule each tick to the next interval boundary, but never past the
  // deadline: the final tick fires exactly when the countdown reaches 0 so
  // onComplete/isComplete are not delayed to the next interval boundary.
  const nextDelay = useCallback((): number | null => {
    if (startedAtRef.current === null) return null;
    const elapsed = accumulatedMsRef.current + (Date.now() - startedAtRef.current);
    const remaining = durationRef.current - elapsed;
    if (remaining <= 0) return null;
    const nextBoundary =
      Math.floor(elapsed / safeInterval) * safeInterval + safeInterval;
    return Math.min(nextBoundary - elapsed, remaining);
  }, [safeInterval]);

  useInterval(tick, isRunning ? nextDelay : null);

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
    // reset() queues its state updates (including isRunning=false); we then
    // set the running refs and isRunning=true synchronously. React batches
    // both updates into a single render, so the started state wins — no
    // intermediate "stopped" render is committed.
    startedAtRef.current = Date.now();
    isRunningRef.current = true;
    setIsRunning(true);
  }, [reset]);

  const formatted = formatTime(remainingMs, format, formatWarnRef.current);

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
