import React from 'react';
import {
  Box,
  Text,
  useInput,
  useIsScreenReaderEnabled,
} from 'ink';
import {resolveComponentFormat, buildAriaTimeDescription} from '../format.js';
import type {CountdownProps} from '../types.js';
import {useCountdown} from './use-countdown.js';

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
  const {formatted, isRunning, isComplete, start, stop, reset} = useCountdown({
    duration,
    autoStart,
    interval: interval ?? (showMilliseconds ? 100 : 1000),
    onTick,
    onComplete,
    format: resolvedFormat,
  });

  useInput(
    input => {
      if (input === ' ') {
        if (isComplete) {
          return;
        }

        if (isRunning) {
          stop();
        } else {
          start();
        }
      } else if (input === 'r' || input === 'R') {
        reset();
      }
    },
    {isActive: enableKeyboard},
  );

  const isScreenReader = useIsScreenReaderEnabled();
  const timeDescription = buildAriaTimeDescription(formatted.totalMs, 'ceil');
  let ariaLabel: string;
  if (isComplete) {
    ariaLabel = 'Countdown complete';
  } else {
    const stateLabel = isRunning ? '' : ', paused';
    ariaLabel = `Countdown: ${timeDescription} remaining${stateLabel}`;
  }

  const isDimColor = dimWhenPaused && !isRunning && !isComplete;

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
        <Text>
          {isComplete ? ' (complete)' : (isRunning ? ' (running)' : ' (paused)')}
        </Text>
      )}
    </Box>
  );
}
