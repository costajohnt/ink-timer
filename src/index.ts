// Hooks
export { useTimer } from './timer/index.js';
export { useCountdown } from './countdown/index.js';
export { useStopwatch } from './stopwatch/index.js';

// Components
export { Timer } from './timer/index.js';
export { Countdown } from './countdown/index.js';
export { Stopwatch } from './stopwatch/index.js';

// Accessibility utilities
export { buildAriaTimeDescription } from './format.js';

// Types (re-export all public types for consumers)
export type {
  // Format
  FormatFunction,
  FormatPreset,
  FormatOption,
  FormattedTime,
  // Timer
  UseTimerOptions,
  UseTimerResult,
  TimerProps,
  // Countdown
  UseCountdownOptions,
  UseCountdownResult,
  CountdownProps,
  // Stopwatch
  Lap,
  UseStopwatchOptions,
  UseStopwatchResult,
  StopwatchProps,
  // Shared component props
  TimerDisplayProps,
} from './types.js';
