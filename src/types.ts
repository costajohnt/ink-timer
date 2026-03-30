/**
 * Function that formats a millisecond value into a display string.
 */
export type FormatFunction = (ms: number) => string;

/**
 * Predefined format presets.
 *
 * - "digital"    -> "02:30" or "1:02:30" (auto hh when >= 1 hour)
 * - "digital-ms" -> "02:30.450" (with milliseconds)
 * - "human"      -> "2m 30s" or "1h 2m 30s"
 * - "human-ms"   -> "2m 30s 450ms"
 */
export type FormatPreset = 'digital' | 'digital-ms' | 'human' | 'human-ms';

/**
 * Format option: either a preset name, a custom function, or undefined (defaults to "digital").
 */
export type FormatOption = FormatPreset | FormatFunction;

/**
 * Formatted time breakdown returned by all hooks.
 */
export interface FormattedTime {
  /** Pre-formatted display string based on the active format option. */
  readonly text: string;
  /** Whole hours component. */
  readonly hours: number;
  /** Whole minutes component (0-59). */
  readonly minutes: number;
  /** Whole seconds component (0-59). */
  readonly seconds: number;
  /** Remaining milliseconds component (0-999). */
  readonly milliseconds: number;
  /** Total elapsed or remaining time in milliseconds. */
  readonly totalMs: number;
}

// --- useTimer ---

export interface UseTimerOptions {
  /**
   * Start the timer immediately on mount.
   * @default true
   */
  autoStart?: boolean;
  /**
   * Update interval in milliseconds.
   * @default 1000
   */
  interval?: number;
  /**
   * Callback fired on every interval tick while running.
   */
  onTick?: (elapsedMs: number) => void;
  /**
   * Format preset or custom format function.
   * @default "digital"
   */
  format?: FormatOption;
}

export interface UseTimerResult {
  /** Elapsed time in milliseconds since start (excluding paused periods). */
  readonly elapsedMs: number;
  /** Whether the timer is currently running. */
  readonly isRunning: boolean;
  /** Formatted time breakdown. */
  readonly formatted: FormattedTime;
  /** Start or resume the timer. No-op if already running. */
  start: () => void;
  /** Pause the timer. No-op if not running. */
  stop: () => void;
  /** Reset to 0 and stop. */
  reset: () => void;
  /** Toggle between running and stopped. */
  toggle: () => void;
}

// --- useCountdown ---

export interface UseCountdownOptions {
  /**
   * Total countdown duration in milliseconds. Required. Must be > 0.
   */
  duration: number;
  /**
   * Start counting down immediately on mount.
   * @default true
   */
  autoStart?: boolean;
  /**
   * Update interval in milliseconds.
   * @default 1000
   */
  interval?: number;
  /**
   * Callback fired on every interval tick while running.
   */
  onTick?: (remainingMs: number) => void;
  /**
   * Callback fired exactly once when the countdown reaches 0.
   */
  onComplete?: () => void;
  /**
   * Format preset or custom format function.
   * @default "digital"
   */
  format?: FormatOption;
}

export interface UseCountdownResult {
  /** Remaining time in milliseconds (clamped to >= 0). */
  readonly remainingMs: number;
  /** Whether the countdown is currently running. */
  readonly isRunning: boolean;
  /** Whether the countdown has reached 0. */
  readonly isComplete: boolean;
  /** Formatted time breakdown of remaining time. */
  readonly formatted: FormattedTime;
  /** Start or resume the countdown. No-op if already running or complete. */
  start: () => void;
  /** Pause the countdown. No-op if not running. */
  stop: () => void;
  /** Reset to the original duration and stop. */
  reset: () => void;
  /** Toggle between running and stopped. */
  toggle: () => void;
  /** Reset and immediately start. Convenience for reset() + start(). */
  restart: () => void;
}

// --- useStopwatch ---

export interface Lap {
  /** 1-indexed lap number. */
  readonly number: number;
  /** Duration of this individual lap in milliseconds. */
  readonly durationMs: number;
  /** Cumulative elapsed time at the moment this lap was recorded. */
  readonly cumulativeMs: number;
  /** Formatted breakdown of this lap's duration. */
  readonly formatted: FormattedTime;
}

export interface UseStopwatchOptions {
  /**
   * Start the stopwatch immediately on mount.
   * @default true
   */
  autoStart?: boolean;
  /**
   * Update interval in milliseconds.
   * @default 1000
   */
  interval?: number;
  /**
   * Callback fired on every interval tick while running.
   */
  onTick?: (elapsedMs: number) => void;
  /**
   * Callback fired when a new lap is recorded.
   */
  onLap?: (lap: Lap) => void;
  /**
   * Format preset or custom format function.
   * @default "digital"
   */
  format?: FormatOption;
}

export interface UseStopwatchResult {
  /** Total elapsed time in milliseconds since start (excluding paused periods). */
  readonly elapsedMs: number;
  /** Whether the stopwatch is currently running. */
  readonly isRunning: boolean;
  /** Array of recorded laps, in chronological order. */
  readonly laps: readonly Lap[];
  /** Formatted time breakdown. */
  readonly formatted: FormattedTime;
  /** Start or resume. No-op if already running. */
  start: () => void;
  /** Pause. No-op if not running. */
  stop: () => void;
  /** Reset to 0, clear all laps, and stop. */
  reset: () => void;
  /** Toggle between running and stopped. */
  toggle: () => void;
  /** Record a lap. Only works while running. */
  lap: () => void;
}

// --- Component props ---

/**
 * Shared visual props for all timer display components.
 */
export interface TimerDisplayProps {
  /** Text to render before the time string. */
  prefix?: string;
  /** Text to render after the time string. */
  suffix?: string;
  /** Text color. Accepts any value supported by Ink's <Text color>. */
  color?: string;
  /** Render time text in bold. @default false */
  bold?: boolean;
  /** Dim the time text when paused. @default true */
  dimWhenPaused?: boolean;
  /** Format preset or custom format function. @default "digital" */
  format?: FormatOption;
  /** Shorthand to switch to "digital-ms" format preset. @default false */
  showMilliseconds?: boolean;
  /** Start automatically on mount. @default true */
  autoStart?: boolean;
  /** Update interval in milliseconds. @default 1000 */
  interval?: number;
  /** Enable keyboard controls (Space: pause/resume, R: reset). @default false */
  enableKeyboard?: boolean;
}

export interface TimerProps extends TimerDisplayProps {
  /** Callback fired every tick. */
  onTick?: (elapsedMs: number) => void;
}

export interface CountdownProps extends TimerDisplayProps {
  /** Total countdown duration in milliseconds. Required. */
  duration: number;
  /** Callback fired when countdown reaches 0. */
  onComplete?: () => void;
  /** Callback fired every tick. */
  onTick?: (remainingMs: number) => void;
}

export interface StopwatchProps extends TimerDisplayProps {
  /** Callback fired every tick. */
  onTick?: (elapsedMs: number) => void;
  /** Callback fired when a lap is recorded. */
  onLap?: (lap: Lap) => void;
  /** Show lap list below the elapsed time. @default true */
  showLaps?: boolean;
  /** Maximum number of laps to display (most recent first). 0 = unlimited. @default 0 */
  maxLapsDisplay?: number;
  /** Enable the L key for recording laps (only when enableKeyboard is true). @default true */
  enableLapKey?: boolean;
}
