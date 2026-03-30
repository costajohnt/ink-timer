import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useTimer } from './use-timer.js';
import { resolveComponentFormat } from '../format.js';
import type { TimerProps } from '../types.js';

export function Timer({
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
}: TimerProps): React.ReactElement {
  const resolvedFormat = resolveComponentFormat(format, showMilliseconds);
  const { formatted, isRunning, start, stop, reset } = useTimer({
    autoStart,
    interval: interval ?? (showMilliseconds ? 100 : 1000),
    onTick,
    format: resolvedFormat,
  });

  useInput(
    (input, _key) => {
      if (input === ' ') {
        isRunning ? stop() : start();
      } else if (input === 'r' || input === 'R') {
        reset();
      }
    },
    { isActive: enableKeyboard },
  );

  const dimColor = dimWhenPaused && !isRunning;

  return (
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
  );
}
