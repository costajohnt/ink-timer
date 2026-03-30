import { useState, useCallback, useRef, useEffect } from 'react';
import { useInterval } from '../use-interval.js';
import { formatTime } from '../format.js';
import type {
  Lap,
  UseStopwatchOptions,
  UseStopwatchResult,
} from '../types.js';

export function useStopwatch(
  options: UseStopwatchOptions = {},
): UseStopwatchResult {
  const {
    autoStart = true,
    interval = 1000,
    onTick,
    onLap,
    format,
  } = options;

  const [isRunning, setIsRunning] = useState(autoStart);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [laps, setLaps] = useState<Lap[]>([]);

  const startedAtRef = useRef<number | null>(autoStart ? Date.now() : null);
  const accumulatedMsRef = useRef(0);
  const isRunningRef = useRef(autoStart);
  const lastLapCumulativeRef = useRef(0);
  const lapCountRef = useRef(0);
  const onTickRef = useRef(onTick);
  const onLapRef = useRef(onLap);

  useEffect(() => { onTickRef.current = onTick; });
  useEffect(() => { onLapRef.current = onLap; });

  const tick = useCallback(() => {
    if (startedAtRef.current === null) return;
    const total = accumulatedMsRef.current + (Date.now() - startedAtRef.current);
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
    lastLapCumulativeRef.current = 0;
    lapCountRef.current = 0;
    setElapsedMs(0);
    setIsRunning(false);
    setLaps([]);
  }, []);

  const toggle = useCallback(() => {
    if (isRunningRef.current) {
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  const lap = useCallback(() => {
    if (startedAtRef.current === null) return;

    const now = Date.now();
    const cumulativeMs =
      accumulatedMsRef.current + (now - startedAtRef.current);
    const durationMs = cumulativeMs - lastLapCumulativeRef.current;
    lastLapCumulativeRef.current = cumulativeMs;
    lapCountRef.current += 1;

    const newLap: Lap = {
      number: lapCountRef.current,
      durationMs,
      cumulativeMs,
      formatted: formatTime(durationMs, format),
    };

    onLapRef.current?.(newLap);
    setLaps((prev) => [...prev, newLap]);
  }, [format]);

  const formatted = formatTime(elapsedMs, format);

  return {
    elapsedMs,
    isRunning,
    laps,
    formatted,
    start,
    stop,
    reset,
    toggle,
    lap,
  };
}
