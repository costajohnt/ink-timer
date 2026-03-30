import { useState, useCallback, useRef, useEffect } from 'react';
import { useInterval } from '../use-interval.js';
import { formatTime } from '../format.js';
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

  const [isRunning, setIsRunning] = useState(autoStart);
  const [isComplete, setIsComplete] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const startedAtRef = useRef<number | null>(autoStart ? Date.now() : null);
  const accumulatedMsRef = useRef(0);
  const isRunningRef = useRef(autoStart);
  const onTickRef = useRef(onTick);
  const onCompleteRef = useRef(onComplete);
  const completeFiredRef = useRef(false);

  useEffect(() => { onTickRef.current = onTick; });
  useEffect(() => { onCompleteRef.current = onComplete; });

  const tick = useCallback(() => {
    if (startedAtRef.current === null) return;

    const now = Date.now();
    const totalElapsed = accumulatedMsRef.current + (now - startedAtRef.current);
    const remaining = Math.max(0, duration - totalElapsed);

    setElapsedMs(totalElapsed);
    onTickRef.current?.(remaining);

    if (remaining <= 0 && !completeFiredRef.current) {
      completeFiredRef.current = true;
      accumulatedMsRef.current = duration;
      startedAtRef.current = null;
      isRunningRef.current = false;
      setIsRunning(false);
      setIsComplete(true);
      onCompleteRef.current?.();
    }
  }, [duration]);

  useInterval(tick, isRunning ? interval : null);

  const remainingMs = Math.max(0, duration - elapsedMs);

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

  const formatted = formatTime(remainingMs, format);

  return {
    remainingMs,
    isRunning,
    isComplete,
    formatted,
    start,
    stop,
    reset,
  };
}
