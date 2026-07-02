import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { act } from 'react';
import { render } from 'ink-testing-library';
import { Text } from 'ink';
import { useInterval, useClampedInterval } from '../src/use-interval.js';
import { advanceTimers } from './helpers.js';

function IntervalTester({
  delay,
  onTick,
}: {
  delay: number | (() => number | null) | null;
  onTick: () => void;
}) {
  useInterval(onTick, delay);
  return React.createElement(Text, null, 'tester');
}

function ClampTester({
  interval,
  onTick,
}: {
  interval: number;
  onTick: (safe: number) => void;
}) {
  const safe = useClampedInterval(interval);
  useInterval(() => {
    onTick(safe);
  }, safe);
  return React.createElement(Text, null, String(safe));
}

describe('useInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls callback at the specified interval', async () => {
    const onTick = vi.fn();
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(IntervalTester, { delay: 1000, onTick }),
      );
    });

    expect(onTick).not.toHaveBeenCalled();

    await advanceTimers(1000);
    expect(onTick).toHaveBeenCalledTimes(1);

    await advanceTimers(1000);
    expect(onTick).toHaveBeenCalledTimes(2);

    await advanceTimers(3000);
    expect(onTick).toHaveBeenCalledTimes(5);

    instance!.unmount();
  });

  it('does not call callback when delay is null', async () => {
    const onTick = vi.fn();
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(IntervalTester, { delay: null, onTick }),
      );
    });

    await advanceTimers(5000);
    expect(onTick).not.toHaveBeenCalled();

    instance!.unmount();
  });

  it('cleans up interval on unmount', async () => {
    const onTick = vi.fn();
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(IntervalTester, { delay: 1000, onTick }),
      );
    });

    await advanceTimers(2000);
    expect(onTick).toHaveBeenCalledTimes(2);

    instance!.unmount();

    await advanceTimers(5000);
    expect(onTick).toHaveBeenCalledTimes(2);
  });

  it('stops calling when delay changes to null via rerender', async () => {
    const onTick = vi.fn();
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(IntervalTester, { delay: 1000, onTick }),
      );
    });

    await advanceTimers(2000);
    expect(onTick).toHaveBeenCalledTimes(2);

    await act(() => {
      instance!.rerender(
        React.createElement(IntervalTester, { delay: null, onTick }),
      );
    });

    await advanceTimers(5000);
    expect(onTick).toHaveBeenCalledTimes(2);

    instance!.unmount();
  });

  it('adjusts when delay changes', async () => {
    const onTick = vi.fn();
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(IntervalTester, { delay: 1000, onTick }),
      );
    });

    await advanceTimers(2000);
    expect(onTick).toHaveBeenCalledTimes(2);

    await act(() => {
      instance!.rerender(
        React.createElement(IntervalTester, { delay: 500, onTick }),
      );
    });

    await advanceTimers(1000);
    expect(onTick).toHaveBeenCalledTimes(4);

    instance!.unmount();
  });

  it('stops when the delay function returns null', async () => {
    const onTick = vi.fn();
    let calls = 0;
    // Fires once (returns 1000), then returns null to stop the loop.
    const getDelay = () => (calls++ < 1 ? 1000 : null);
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(IntervalTester, { delay: getDelay, onTick }),
      );
    });

    await advanceTimers(5000);
    expect(onTick).toHaveBeenCalledTimes(1);

    instance!.unmount();
  });

  it('never schedules when the delay function returns null from the start', async () => {
    const onTick = vi.fn();
    const getDelay = () => null;
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(IntervalTester, { delay: getDelay, onTick }),
      );
    });

    await advanceTimers(5000);
    expect(onTick).not.toHaveBeenCalled();

    instance!.unmount();
  });
});

describe('useClampedInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('clamps a zero interval to the 16ms minimum and keeps ticking', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const onTick = vi.fn();
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(ClampTester, { interval: 0, onTick }),
      );
    });

    expect(instance!.lastFrame()).toBe('16');
    await advanceTimers(16);
    expect(onTick).toHaveBeenCalledTimes(1);
    expect(onTick).toHaveBeenLastCalledWith(16);

    warnSpy.mockRestore();
    instance!.unmount();
  });

  it('clamps a non-finite (NaN) interval to the 16ms minimum instead of a tight loop', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const onTick = vi.fn();
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(ClampTester, { interval: Number.NaN, onTick }),
      );
    });

    expect(instance!.lastFrame()).toBe('16');
    // A NaN delay would degrade to setTimeout(0) and fire many times in 16ms;
    // clamping means exactly one tick lands at 16ms.
    await advanceTimers(16);
    expect(onTick).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();
    instance!.unmount();
  });

  it('warns once per instance, independently across instances', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const onTick = vi.fn();
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(
          React.Fragment,
          null,
          React.createElement(ClampTester, { interval: 0, onTick }),
          React.createElement(ClampTester, { interval: 0, onTick }),
        ),
      );
    });

    // Two invalid instances warn twice total (once each), not once process-wide
    // and not repeatedly per render.
    expect(warnSpy).toHaveBeenCalledTimes(2);

    warnSpy.mockRestore();
    instance!.unmount();
  });
});
