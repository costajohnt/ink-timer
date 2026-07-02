import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { act } from 'react';
import { render } from 'ink-testing-library';
import { Text } from 'ink';
import { useStopwatch } from '../src/stopwatch/use-stopwatch.js';
import type { UseStopwatchOptions } from '../src/types.js';
import { advanceTimers } from './helpers.js';

function StopwatchHarness(
  props: UseStopwatchOptions & { action?: 'start' | 'stop' | 'reset' | 'lap' | 'toggle' },
) {
  const { action, ...options } = props;
  const sw = useStopwatch(options);

  React.useEffect(() => {
    if (action === 'start') sw.start();
    if (action === 'stop') sw.stop();
    if (action === 'reset') sw.reset();
    if (action === 'lap') sw.lap();
    if (action === 'toggle') sw.toggle();
  }, [action]);

  // Use short keys to keep JSON output under Ink's 100-char line width
  const cl = sw.laps.map((l) => ({
    n: l.number,
    d: l.durationMs,
    c: l.cumulativeMs,
  }));

  return React.createElement(
    Text,
    null,
    JSON.stringify({
      e: sw.elapsedMs,
      r: sw.isRunning,
      l: cl,
      t: sw.formatted.text,
    }),
  );
}

interface CompactLap {
  n: number;
  d: number;
  c: number;
}

function parseFrame(frame: string | undefined) {
  const raw = JSON.parse(frame ?? '{}') as {
    e: number;
    r: boolean;
    l: CompactLap[];
    t: string;
  };
  return {
    elapsedMs: raw.e,
    isRunning: raw.r,
    laps: raw.l,
    text: raw.t,
  };
}

describe('useStopwatch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts automatically and tracks elapsed time', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(StopwatchHarness, { interval: 1000 }),
      );
    });

    await advanceTimers(3000);
    const state = parseFrame(instance!.lastFrame());
    expect(state.elapsedMs).toBe(3000);
    expect(state.isRunning).toBe(true);
    expect(state.text).toBe('00:03');

    instance!.unmount();
  });

  it('records laps', async () => {
    const onLap = vi.fn();
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(StopwatchHarness, { interval: 1000, onLap }),
      );
    });

    // Run for 3 seconds, then lap
    await advanceTimers(3000);
    await act(() => {
      instance!.rerender(
        React.createElement(StopwatchHarness, {
          interval: 1000,
          onLap,
          action: 'lap',
        }),
      );
    });
    await advanceTimers(100);

    const state = parseFrame(instance!.lastFrame());
    expect(state.laps).toHaveLength(1);
    expect(state.laps[0]!.n).toBe(1);
    expect(state.laps[0]!.d).toBeGreaterThan(0);
    expect(state.laps[0]!.c).toBeGreaterThan(0);
    expect(onLap).toHaveBeenCalledTimes(1);

    instance!.unmount();
  });

  it('pauses and resumes', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(StopwatchHarness, { interval: 1000 }),
      );
    });

    await advanceTimers(2000);
    let state = parseFrame(instance!.lastFrame());
    expect(state.elapsedMs).toBe(2000);

    // Pause
    await act(() => {
      instance!.rerender(
        React.createElement(StopwatchHarness, {
          interval: 1000,
          action: 'stop',
        }),
      );
    });
    await advanceTimers(100);

    await advanceTimers(5000);
    state = parseFrame(instance!.lastFrame());
    expect(state.elapsedMs).toBe(2000);
    expect(state.isRunning).toBe(false);

    // Resume
    await act(() => {
      instance!.rerender(
        React.createElement(StopwatchHarness, {
          interval: 1000,
          action: 'start',
        }),
      );
    });
    await advanceTimers(100);

    await advanceTimers(3000);
    state = parseFrame(instance!.lastFrame());
    expect(state.elapsedMs).toBe(5000);
    expect(state.isRunning).toBe(true);

    instance!.unmount();
  });

  it('resets elapsed and clears laps', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(StopwatchHarness, { interval: 1000 }),
      );
    });

    await advanceTimers(3000);

    // Record a lap
    await act(() => {
      instance!.rerender(
        React.createElement(StopwatchHarness, {
          interval: 1000,
          action: 'lap',
        }),
      );
    });
    await advanceTimers(100);

    let state = parseFrame(instance!.lastFrame());
    expect(state.laps).toHaveLength(1);

    // Reset
    await act(() => {
      instance!.rerender(
        React.createElement(StopwatchHarness, {
          interval: 1000,
          action: 'reset',
        }),
      );
    });
    await advanceTimers(100);

    state = parseFrame(instance!.lastFrame());
    expect(state.elapsedMs).toBe(0);
    expect(state.isRunning).toBe(false);
    expect(state.laps).toHaveLength(0);

    instance!.unmount();
  });

  it('does not start when autoStart is false', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(StopwatchHarness, {
          interval: 1000,
          autoStart: false,
        }),
      );
    });

    await advanceTimers(5000);
    const state = parseFrame(instance!.lastFrame());
    expect(state.elapsedMs).toBe(0);
    expect(state.isRunning).toBe(false);

    instance!.unmount();
  });

  it('calls onTick with elapsed ms', async () => {
    const onTick = vi.fn();
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(StopwatchHarness, { interval: 1000, onTick }),
      );
    });

    await advanceTimers(2000);
    expect(onTick).toHaveBeenCalledTimes(2);
    expect(onTick).toHaveBeenLastCalledWith(2000);

    instance!.unmount();
  });

  it('keeps ticks aligned to interval boundaries', async () => {
    const onTick = vi.fn();
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(StopwatchHarness, { interval: 1000, onTick }),
      );
    });

    await advanceTimers(3000);
    expect(onTick.mock.calls.map((c) => c[0])).toEqual([1000, 2000, 3000]);

    instance!.unmount();
  });

  it('re-aligns the next tick to the elapsed boundary after a non-boundary pause', async () => {
    const onTick = vi.fn();
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(StopwatchHarness, { interval: 1000, onTick }),
      );
    });

    // Tick at 1000, then move to 1300 (a non-boundary offset) and pause.
    await advanceTimers(1000);
    await advanceTimers(300);
    await act(() => {
      instance!.rerender(
        React.createElement(StopwatchHarness, { interval: 1000, onTick, action: 'stop' }),
      );
    });
    await advanceTimers(100);
    const ticksBefore = onTick.mock.calls.length;

    // Resume. Elapsed is 1300, so the next tick must land on the 2000 boundary
    // (700ms later), NOT at resume+1000 (elapsed 2300). A fixed setInterval
    // would fire at resume+1000; the boundary scheduler fires at 700ms.
    await act(() => {
      instance!.rerender(
        React.createElement(StopwatchHarness, { interval: 1000, onTick, action: 'start' }),
      );
    });

    await advanceTimers(699);
    expect(onTick.mock.calls.length).toBe(ticksBefore);

    await advanceTimers(1);
    expect(onTick.mock.calls.length).toBe(ticksBefore + 1);
    expect(onTick).toHaveBeenLastCalledWith(2000);

    instance!.unmount();
  });

  it('toggle switches between running and stopped', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(StopwatchHarness, { interval: 1000 }),
      );
    });

    await advanceTimers(2000);
    let state = parseFrame(instance!.lastFrame());
    expect(state.isRunning).toBe(true);

    // Toggle off
    await act(() => {
      instance!.rerender(
        React.createElement(StopwatchHarness, {
          interval: 1000,
          action: 'toggle',
        }),
      );
    });
    await advanceTimers(100);

    state = parseFrame(instance!.lastFrame());
    expect(state.isRunning).toBe(false);

    instance!.unmount();
  });
});
