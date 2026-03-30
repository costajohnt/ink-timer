import { useState, useCallback, useRef, useEffect } from 'react';
import { useInterval } from '../use-interval.js';
import { formatTime } from '../format.js';
import type { UseTimerOptions, UseTimerResult } from '../types.js';

export function useTimer(options: UseTimerOptions = {}): UseTimerResult {
  const {
    autoStart = true,
    interval = 1000,
    onTick,
    format,
  } = options;

  const [isRunning, setIsRunning] = useState(autoStart);
  const [elapsedMs, setElapsedMs] = useState(0);

  const startedAtRef = useRef<number | null>(autoStart ? Date.now() : null);
  const accumulatedMsRef = useRef(0);
  const isRunningRef = useRef(autoStart);

  const onTickRef = useRef(onTick);
  useEffect(() => {
    onTickRef.current = onTick;
  });

  const tick = useCallback(() => {
    if (startedAtRef.current === null) return;

    const now = Date.now();
    const total = accumulatedMsRef.current + (now - startedAtRef.current);
    setElapsedMs(total);
    onTickRef.current?.(total);
  }, []);

  useInterval(tick, isRunning ? interval : null);

  const start = useCallback(() => {
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
    isRunningRef.current = false;
    setElapsedMs(0);
    setIsRunning(false);
  }, []);

  const toggle = useCallback(() => {
    if (isRunningRef.current) {
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  const formatted = formatTime(elapsedMs, format);

  return {
    elapsedMs,
    isRunning,
    formatted,
    start,
    stop,
    reset,
    toggle,
  };
}
