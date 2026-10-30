import React from 'react';
import {
  Box,
  Text,
  useInput,
  useIsScreenReaderEnabled,
} from 'ink';
import {resolveComponentFormat, buildAriaTimeDescription} from '../format.js';
import type {StopwatchProps} from '../types.js';
import {useStopwatch} from './use-stopwatch.js';

export function Stopwatch({
  prefix,
  suffix,
  color,
  bold = false,
  dimWhenPaused = true,
  format,
  showMilliseconds,
  autoStart = true,
  interval,
  enableKeyboard = false,
  onTick,
  onLap,
  showLaps = true,
  maxLapsDisplay = 0,
  enableLapKey = true,
}: StopwatchProps): React.ReactElement {
  const resolvedFormat = resolveComponentFormat(format, showMilliseconds);
  const {formatted, isRunning, laps, start, stop, reset, lap} = useStopwatch({
    autoStart,
    interval: interval ?? (showMilliseconds ? 100 : 1000),
    onTick,
    onLap,
    format: resolvedFormat,
  });

  useInput(
    input => {
      if (input === ' ') {
        if (isRunning) {
          stop();
        } else {
          start();
        }
      } else if (input === 'r' || input === 'R') {
        reset();
      } else if (enableLapKey && (input === 'l' || input === 'L')) {
        lap();
      }
    },
    {isActive: enableKeyboard},
  );

  const isScreenReader = useIsScreenReaderEnabled();
  const timeDescription = buildAriaTimeDescription(formatted.totalMs);
  const stateLabel = isRunning ? '' : ', paused';
  const ariaLabel = `Stopwatch: ${timeDescription} elapsed${stateLabel}`;
  const isDimColor = dimWhenPaused && !isRunning;

  const displayLaps = showLaps
    ? (maxLapsDisplay > 0
      ? laps.slice(-maxLapsDisplay)
      : laps)
    : [];

  return (
    <Box flexDirection="column">
      <Box aria-role="timer">
        {prefix !== undefined && (
          <Text dimColor={isDimColor} aria-hidden>{prefix}</Text>
        )}
        <Text color={color} bold={bold} dimColor={isDimColor} aria-label={ariaLabel}>
          {formatted.text}
        </Text>
        {suffix !== undefined && (
          <Text dimColor={isDimColor} aria-hidden>{suffix}</Text>
        )}
        {isScreenReader && (
          <Text> ({isRunning ? 'running' : 'paused'})</Text>
        )}
      </Box>

      {displayLaps.length > 0 && (
        <Box flexDirection="column" marginTop={1} aria-role="list">
          <Text aria-label="Lap times" />
          {displayLaps.map(l => (
            <Box
              key={l.number}
              gap={1}
              aria-role="listitem"
            >
              <Text dimColor aria-hidden>Lap {l.number}</Text>
              <Text aria-label={`Lap ${l.number}: ${buildAriaTimeDescription(l.durationMs)}`}>{l.formatted.text}</Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
