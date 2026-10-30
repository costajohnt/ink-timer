import React from 'react';
import {
  Box,
  Text,
  useInput,
  useIsScreenReaderEnabled,
} from 'ink';
import {resolveComponentFormat, buildAriaTimeDescription} from '../format.js';
import type {TimerProps} from '../types.js';
import {useTimer} from './use-timer.js';

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
  const {formatted, isRunning, start, stop, reset} = useTimer({
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
    {isActive: enableKeyboard},
  );

  const isScreenReader = useIsScreenReaderEnabled();
  const timeDescription = buildAriaTimeDescription(formatted.totalMs);
  const stateLabel = isRunning ? '' : ', paused';
  const ariaLabel = `Timer: ${timeDescription} elapsed${stateLabel}`;
  const isDimColor = dimWhenPaused && !isRunning;

  return (
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
  );
}
