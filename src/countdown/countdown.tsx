import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useCountdown } from './use-countdown.js';
import { resolveComponentFormat } from '../format.js';
import type { CountdownProps } from '../types.js';

export function Countdown({
  duration,
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
  onComplete,
  onTick,
}: CountdownProps): React.ReactElement {
  const resolvedFormat = resolveComponentFormat(format, showMilliseconds);
  const { formatted, isRunning, isComplete, start, stop, reset } = useCountdown({
    duration,
    autoStart,
    interval: interval ?? (showMilliseconds ? 100 : 1000),
    onTick,
    onComplete,
    format: resolvedFormat,
  });

  useInput(
    (input) => {
      if (input === ' ') {
        if (isComplete) return;
        isRunning ? stop() : start();
      } else if (input === 'r' || input === 'R') {
        reset();
      }
    },
    { isActive: enableKeyboard },
  );

  const dimColor = dimWhenPaused && !isRunning && !isComplete;

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
