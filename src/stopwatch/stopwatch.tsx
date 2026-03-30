import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useStopwatch } from './use-stopwatch.js';
import { resolveComponentFormat } from '../format.js';
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

  const dimColor = dimWhenPaused && !isRunning;

  const displayLaps = showLaps
    ? maxLapsDisplay > 0
      ? laps.slice(-maxLapsDisplay)
      : laps
    : [];

  return (
    <Box flexDirection="column">
      <Box>
        {prefix !== undefined && (
          <Text dimColor={dimColor}>{prefix}</Text>
        )}
        <Text color={color} bold={bold} dimColor={dimColor}>
          {formatted.text}
        </Text>
        {suffix !== undefined && (
          <Text dimColor={dimColor}>{suffix}</Text>
        )}
      </Box>

      {displayLaps.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          {displayLaps.map((l) => (
            <Box key={l.number} gap={1}>
              <Text dimColor>Lap {l.number}</Text>
              <Text>{l.formatted.text}</Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
