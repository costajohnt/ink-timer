import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatTime, resolveComponentFormat, buildAriaTimeDescription, _resetFormatWarning } from '../src/format.js';

describe('formatTime', () => {
  describe('digital preset (default)', () => {
    it('formats 0ms', () => {
      const result = formatTime(0, 'digital');
      expect(result.text).toBe('00:00');
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
      expect(result.milliseconds).toBe(0);
      expect(result.totalMs).toBe(0);
    });

    it('formats seconds only', () => {
      expect(formatTime(5000, 'digital').text).toBe('00:05');
    });

    it('formats minutes and seconds', () => {
      expect(formatTime(150_000, 'digital').text).toBe('02:30');
    });

    it('auto-includes hours when >= 1 hour', () => {
      expect(formatTime(3_661_000, 'digital').text).toBe('1:01:01');
    });

    it('pads minutes when hours are present', () => {
      expect(formatTime(3_600_000, 'digital').text).toBe('1:00:00');
    });

    it('uses digital as default when format is undefined', () => {
      expect(formatTime(5000, undefined).text).toBe('00:05');
    });

    it('uses floor, not round (59999ms shows 00:59)', () => {
      expect(formatTime(59_999, 'digital').text).toBe('00:59');
    });
  });

  describe('digital-ms preset', () => {
    it('formats 0ms', () => {
      expect(formatTime(0, 'digital-ms').text).toBe('00:00.000');
    });

    it('includes milliseconds', () => {
      expect(formatTime(150_450, 'digital-ms').text).toBe('02:30.450');
    });

    it('includes hours when >= 1 hour', () => {
      expect(formatTime(3_661_123, 'digital-ms').text).toBe('1:01:01.123');
    });

    it('pads milliseconds to 3 digits', () => {
      expect(formatTime(1_005, 'digital-ms').text).toBe('00:01.005');
    });
  });

  describe('human preset', () => {
    it('formats 0ms as "0s"', () => {
      expect(formatTime(0, 'human').text).toBe('0s');
    });

    it('formats seconds only', () => {
      expect(formatTime(5000, 'human').text).toBe('5s');
    });

    it('formats minutes and seconds', () => {
      expect(formatTime(150_000, 'human').text).toBe('2m 30s');
    });

    it('formats hours, minutes, and seconds', () => {
      expect(formatTime(3_661_000, 'human').text).toBe('1h 1m 1s');
    });

    it('shows 0m when hours are present but minutes are 0', () => {
      expect(formatTime(3_605_000, 'human').text).toBe('1h 0m 5s');
    });
  });

  describe('human-ms preset', () => {
    it('formats 0ms', () => {
      expect(formatTime(0, 'human-ms').text).toBe('0s 0ms');
    });

    it('includes milliseconds', () => {
      expect(formatTime(150_450, 'human-ms').text).toBe('2m 30s 450ms');
    });

    it('includes all components', () => {
      expect(formatTime(3_661_123, 'human-ms').text).toBe('1h 1m 1s 123ms');
    });
  });

  describe('custom format function', () => {
    it('uses the custom function', () => {
      const custom = (ms: number) => `${ms}ms raw`;
      const result = formatTime(5000, custom);
      expect(result.text).toBe('5000ms raw');
    });

    it('still provides numeric components', () => {
      const custom = () => 'custom';
      const result = formatTime(150_450, custom);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(2);
      expect(result.seconds).toBe(30);
      expect(result.milliseconds).toBe(450);
    });
  });

  describe('numeric components', () => {
    it('decomposes correctly for large values', () => {
      const result = formatTime(7_261_999, 'digital');
      expect(result.hours).toBe(2);
      expect(result.minutes).toBe(1);
      expect(result.seconds).toBe(1);
      expect(result.milliseconds).toBe(999);
      expect(result.totalMs).toBe(7_261_999);
    });

    it('clamps negative values to 0', () => {
      const result = formatTime(-1000, 'digital');
      expect(result.text).toBe('00:00');
      expect(result.totalMs).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
      expect(result.milliseconds).toBe(0);
    });
  });
});

describe('custom format error handling', () => {
  beforeEach(() => {
    _resetFormatWarning();
  });

  it('falls back to digital when custom format throws', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const broken = () => { throw new Error('boom'); };
    const result = formatTime(5000, broken);
    expect(result.text).toBe('00:05');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Custom format function threw an error'),
      expect.any(Error),
    );
    warnSpy.mockRestore();
  });

  it('warns only once for repeated errors', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const broken = () => { throw new Error('boom'); };
    formatTime(1000, broken);
    formatTime(2000, broken);
    formatTime(3000, broken);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });
});

describe('buildAriaTimeDescription', () => {
  it('returns "0 seconds" for 0ms', () => {
    expect(buildAriaTimeDescription(0)).toBe('0 seconds');
  });

  it('uses singular "second" for 1 second', () => {
    expect(buildAriaTimeDescription(1000)).toBe('1 second');
  });

  it('uses plural "seconds" for multiple seconds', () => {
    expect(buildAriaTimeDescription(5000)).toBe('5 seconds');
  });

  it('includes minutes and seconds', () => {
    expect(buildAriaTimeDescription(150_000)).toBe('2 minutes 30 seconds');
  });

  it('uses singular "minute" for 1 minute', () => {
    expect(buildAriaTimeDescription(60_000)).toBe('1 minute 0 seconds');
  });

  it('includes hours, minutes, and seconds', () => {
    expect(buildAriaTimeDescription(3_661_000)).toBe('1 hour 1 minute 1 second');
  });

  it('uses plural "hours" for multiple hours', () => {
    expect(buildAriaTimeDescription(7_200_000)).toBe('2 hours 0 seconds');
  });

  it('clamps negative values', () => {
    expect(buildAriaTimeDescription(-1000)).toBe('0 seconds');
  });
});

describe('resolveComponentFormat', () => {
  it('returns explicit format when provided', () => {
    expect(resolveComponentFormat('human', true)).toBe('human');
  });

  it('returns digital-ms when showMilliseconds is true and no format', () => {
    expect(resolveComponentFormat(undefined, true)).toBe('digital-ms');
  });

  it('returns digital as default', () => {
    expect(resolveComponentFormat(undefined, undefined)).toBe('digital');
    expect(resolveComponentFormat(undefined, false)).toBe('digital');
  });

  it('returns custom function when provided', () => {
    const fn = (ms: number) => `${ms}`;
    expect(resolveComponentFormat(fn, true)).toBe(fn);
  });
});
