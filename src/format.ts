import type { FormatFunction, FormatOption, FormatPreset, FormattedTime } from './types.js';

/**
 * Decompose a millisecond value into hours, minutes, seconds, milliseconds.
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

  return { hours, minutes, seconds, milliseconds };
}

/** Pad a number to at least `width` digits. */
function pad(n: number, width: number): string {
  return String(n).padStart(width, '0');
}

/**
 * Built-in format presets.
 */
const presets: Record<FormatPreset, FormatFunction> = {
  digital(totalMs: number): string {
    const { hours, minutes, seconds } = decompose(totalMs);
    if (hours > 0) {
      return `${hours}:${pad(minutes, 2)}:${pad(seconds, 2)}`;
    }
    return `${pad(minutes, 2)}:${pad(seconds, 2)}`;
  },

  'digital-ms'(totalMs: number): string {
    const { hours, minutes, seconds, milliseconds } = decompose(totalMs);
    const msStr = pad(milliseconds, 3);
    if (hours > 0) {
      return `${hours}:${pad(minutes, 2)}:${pad(seconds, 2)}.${msStr}`;
    }
    return `${pad(minutes, 2)}:${pad(seconds, 2)}.${msStr}`;
  },

  human(totalMs: number): string {
    const { hours, minutes, seconds } = decompose(totalMs);
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    return parts.join(' ');
  },

  'human-ms'(totalMs: number): string {
    const { hours, minutes, seconds, milliseconds } = decompose(totalMs);
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    parts.push(`${milliseconds}ms`);
    return parts.join(' ');
  },
};

/**
 * Resolve a FormatOption into a concrete FormatFunction.
 */
function resolveFormatter(format: FormatOption | undefined): FormatFunction {
  if (typeof format === 'function') {
    return format;
  }
  return presets[format ?? 'digital'];
}

/**
 * Build a complete FormattedTime object from a raw millisecond value.
 */
export function formatTime(
  totalMs: number,
  format: FormatOption | undefined,
): FormattedTime {
  const { hours, minutes, seconds, milliseconds } = decompose(totalMs);
  const formatter = resolveFormatter(format);

  return {
    text: formatter(totalMs),
    hours,
    minutes,
    seconds,
    milliseconds,
    totalMs: Math.max(0, totalMs),
  };
}

/**
 * Resolve showMilliseconds + format prop for components.
 * If format is explicitly set, it wins. Otherwise showMilliseconds maps to "digital-ms".
 */
export function resolveComponentFormat(
  format: FormatOption | undefined,
  showMilliseconds: boolean | undefined,
): FormatOption {
  if (format !== undefined) return format;
  if (showMilliseconds) return 'digital-ms';
  return 'digital';
}
