import React from 'react';
import { Box, Text, useInput, useIsScreenReaderEnabled } from 'ink';
import { useStopwatch } from './use-stopwatch.js';
import { resolveComponentFormat, buildAriaTimeDescription } from '../format.js';
import type { StopwatchProps } from '../types.js';

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
  const { formatted, isRunning, laps, start, stop, reset, lap } = useStopwatch({
    autoStart,
    interval: interval ?? (showMilliseconds ? 100 : 1000),
    onTick,
    onLap,
    format: resolvedFormat,
  });

  useInput(
    (input) => {
      if (input === ' ') {
        isRunning ? stop() : start();
      } else if (input === 'r' || input === 'R') {
        reset();
      } else if ((input === 'l' || input === 'L') && enableLapKey) {
        lap();
      }
    },
    { isActive: enableKeyboard },
  );

  const screenReader = useIsScreenReaderEnabled();
  const timeDescription = buildAriaTimeDescription(formatted.totalMs);
  const stateLabel = isRunning ? '' : ', paused';
  const ariaLabel = `Stopwatch: ${timeDescription} elapsed${stateLabel}`;
  const dimColor = dimWhenPaused && !isRunning;

  const displayLaps = showLaps
    ? maxLapsDisplay > 0
      ? laps.slice(-maxLapsDisplay)
      : laps
    : [];

  return (
    <Box flexDirection="column">
      <Box aria-role="timer" aria-label={ariaLabel}>
        {prefix !== undefined && (
          <Text dimColor={dimColor} aria-hidden>{prefix}</Text>
        )}
        <Text color={color} bold={bold} dimColor={dimColor}>
          {formatted.text}
        </Text>
        {suffix !== undefined && (
          <Text dimColor={dimColor} aria-hidden>{suffix}</Text>
        )}
        {screenReader && (
          <Text> ({isRunning ? 'running' : 'paused'})</Text>
        )}
      </Box>

      {displayLaps.length > 0 && (
        <Box flexDirection="column" marginTop={1} aria-role="list" aria-label="Lap times">
          {displayLaps.map((l) => (
            <Box
              key={l.number}
              gap={1}
              aria-role="listitem"
              aria-label={`Lap ${l.number}: ${buildAriaTimeDescription(l.durationMs)}`}
            >
              <Text dimColor>Lap {l.number}</Text>
              <Text>{l.formatted.text}</Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
