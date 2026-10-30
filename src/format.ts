import type {
  FormatFunction,
  FormatOption,
  FormatPreset,
  FormattedTime,
} from './types.js';

/**
 Decompose a millisecond value into hours, minutes, seconds, milliseconds.
 */
function decompose(totalMs: number): {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
} {
  const ms = Math.max(0, totalMs);

  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  const milliseconds = Math.floor(ms % 1000);

  return {
    hours, minutes, seconds, milliseconds,
  };
}

/**
Pad a number to at least `width` digits.
*/
function pad(n: number, width: number): string {
  return String(n).padStart(width, '0');
}

/**
 Built-in format presets.
 */
const presets: Record<FormatPreset, FormatFunction> = {
  digital(totalMs: number): string {
    const {hours, minutes, seconds} = decompose(totalMs);
    return hours > 0 ? `${hours}:${pad(minutes, 2)}:${pad(seconds, 2)}` : `${pad(minutes, 2)}:${pad(seconds, 2)}`;
  },

  'digital-ms'(totalMs: number): string {
    const {hours, minutes, seconds, milliseconds} = decompose(totalMs);
    const msString = pad(milliseconds, 3);
    return hours > 0 ? `${hours}:${pad(minutes, 2)}:${pad(seconds, 2)}.${msString}` : `${pad(minutes, 2)}:${pad(seconds, 2)}.${msString}`;
  },

  human(totalMs: number): string {
    const {hours, minutes, seconds} = decompose(totalMs);
    const parts = hours > 0 ? [`${hours}h`] : [];

    if (minutes > 0 || hours > 0) {
      parts.push(`${minutes}m`);
    }

    parts.push(`${seconds}s`);
    return parts.join(' ');
  },

  'human-ms'(totalMs: number): string {
    const {hours, minutes, seconds, milliseconds} = decompose(totalMs);
    const parts = hours > 0 ? [`${hours}h`] : [];

    if (minutes > 0 || hours > 0) {
      parts.push(`${minutes}m`);
    }

    parts.push(`${seconds}s`, `${milliseconds}ms`);
    return parts.join(' ');
  },
};

/**
 Resolve a FormatOption into a concrete FormatFunction.
 */
function resolveFormatter(format: FormatOption | undefined): FormatFunction {
  return typeof format === 'function' ? format : presets[format ?? 'digital'];
}

/**
 How sub-second remainders are handled by second-resolution output.
 Count-up values (timer, stopwatch) use 'floor': a value is shown once it
 has been reached. Count-down values (countdown remaining time) use 'ceil':
 the display reads 00:00 only once the countdown is actually complete.
 */
export type Rounding = 'floor' | 'ceil';

/**
Round a value up to the next whole second when rounding is 'ceil'.
*/
function roundToSecond(totalMs: number, rounding: Rounding): number {
  const ms = Math.max(0, totalMs);
  return rounding === 'ceil' ? Math.ceil(ms / 1000) * 1000 : ms;
}

/**
Presets whose output has no sub-second component.
*/
const secondResolutionFormats = new Set<FormatOption | undefined>([undefined, 'digital', 'human']);

function isSecondResolutionPreset(format: FormatOption | undefined): boolean {
  return secondResolutionFormats.has(format);
}

/**
 Mutable one-shot warning context. Callers (e.g. each hook instance) own
 their own object so a warning fires once per caller instead of once per
 process. See `formatTime`.
 */
export type WarnOnce = {
  warned: boolean;
};

/**
 Build a complete FormattedTime object from a raw millisecond value.
 
 If a user-provided custom format function throws, the error is caught,
 a dev-mode warning is emitted, and the 'digital' preset is used as a
 fallback. Pass a `warnOnce` context to deduplicate the warning across
 repeated calls from the same caller; without one, every failing call warns.
 
 With `rounding: 'ceil'` the second-resolution presets ('digital', 'human')
 round up to the next whole second, and the hours/minutes/seconds fields
 match the displayed text. Millisecond presets are exact either way, and
 custom format functions always receive the raw value.
 */
export function formatTime(
  totalMs: number,
  format: FormatOption | undefined,
  warnOnce?: WarnOnce,
  rounding: Rounding = 'floor',
): FormattedTime {
  const displayMs = isSecondResolutionPreset(format)
    ? roundToSecond(totalMs, rounding)
    : totalMs;
  const {hours, minutes, seconds, milliseconds} = decompose(displayMs);
  const formatter = resolveFormatter(format);

  let text: string;
  try {
    text = formatter(displayMs);
  } catch (error) {
    if (process.env['NODE_ENV'] !== 'production' && !warnOnce?.warned) {
      if (warnOnce) {
        warnOnce.warned = true;
      }

      console.warn(
        '[ink-timer] Custom format function threw an error. ' +
        'Falling back to "digital" preset.',
        error,
      );
    }

    text = presets.digital(roundToSecond(totalMs, rounding));
  }

  return {
    text,
    hours,
    minutes,
    seconds,
    milliseconds,
    totalMs: Math.max(0, totalMs),
  };
}

/**
 Build a human-readable time description for screen readers.
 E.g. 150000ms → "2 minutes 30 seconds"
 
 Pass `rounding: 'ceil'` for remaining time so the description does not
 read "0 seconds" while time is still left.
 */
export function buildAriaTimeDescription(
  totalMs: number,
  rounding: Rounding = 'floor',
): string {
  const {hours, minutes, seconds} = decompose(roundToSecond(totalMs, rounding));
  const parts = hours > 0 ? [`${hours} ${hours === 1 ? 'hour' : 'hours'}`] : [];

  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  }

  parts.push(`${seconds} ${seconds === 1 ? 'second' : 'seconds'}`);
  return parts.join(' ');
}

/**
 Resolve showMilliseconds + format prop for components.
 If format is explicitly set, it wins. Otherwise showMilliseconds maps to "digital-ms".
 */
export function resolveComponentFormat(
  format: FormatOption | undefined,
  showMilliseconds: boolean | undefined,
): FormatOption {
  if (format !== undefined) {
    return format;
  }

  return showMilliseconds ? 'digital-ms' : 'digital';
}
