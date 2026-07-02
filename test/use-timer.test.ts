import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { act } from 'react';
import { render } from 'ink-testing-library';
import { Text } from 'ink';
import { useTimer } from '../src/timer/use-timer.js';
import type { UseTimerOptions } from '../src/types.js';
import { advanceTimers } from './helpers.js';

function TimerHarness(props: UseTimerOptions) {
  const timer = useTimer(props);
  return React.createElement(
    Text,
    null,
    JSON.stringify({
      elapsedMs: timer.elapsedMs,
      isRunning: timer.isRunning,
      text: timer.formatted.text,
    }),
  );
}

function TimerWithControls({
  action,
  ...options
}: UseTimerOptions & { action?: 'start' | 'stop' | 'reset' | 'toggle' }) {
  const timer = useTimer(options);

  React.useEffect(() => {
    if (action === 'start') timer.start();
    if (action === 'stop') timer.stop();
    if (action === 'reset') timer.reset();
    if (action === 'toggle') timer.toggle();
  }, [action]);

  return React.createElement(
    Text,
    null,
    JSON.stringify({
      elapsedMs: timer.elapsedMs,
      isRunning: timer.isRunning,
      text: timer.formatted.text,
    }),
  );
}

function parseFrame(frame: string | undefined): {
  elapsedMs: number;
  isRunning: boolean;
  text: string;
} {
  return JSON.parse(frame ?? '{}');
}

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts automatically by default', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(React.createElement(TimerHarness, {}));
    });
    const state = parseFrame(instance!.lastFrame());
    expect(state.isRunning).toBe(true);
    expect(state.elapsedMs).toBe(0);
    instance!.unmount();
  });

  it('does not start when autoStart is false', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(TimerHarness, { autoStart: false }),
      );
    });
    const state = parseFrame(instance!.lastFrame());
    expect(state.isRunning).toBe(false);

    await advanceTimers(5000);
    const state2 = parseFrame(instance!.lastFrame());
    expect(state2.elapsedMs).toBe(0);

    instance!.unmount();
  });

  it('tracks elapsed time on interval ticks', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(TimerHarness, { interval: 1000 }),
      );
    });

    await advanceTimers(3000);
    const state = parseFrame(instance!.lastFrame());
    expect(state.elapsedMs).toBe(3000);
    expect(state.text).toBe('00:03');

    instance!.unmount();
  });

  it('formats elapsed time correctly', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(TimerHarness, { interval: 1000 }),
      );
    });

    await advanceTimers(150_000);
    const state = parseFrame(instance!.lastFrame());
    expect(state.text).toBe('02:30');

    instance!.unmount();
  });

  it('respects custom format', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(TimerHarness, { interval: 1000, format: 'human' }),
      );
    });

    await advanceTimers(150_000);
    const state = parseFrame(instance!.lastFrame());
    expect(state.text).toBe('2m 30s');

    instance!.unmount();
  });

  it('calls onTick on each interval', async () => {
    const onTick = vi.fn();
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(TimerHarness, { interval: 1000, onTick }),
      );
    });

    await advanceTimers(3000);
    expect(onTick).toHaveBeenCalledTimes(3);
    expect(onTick).toHaveBeenLastCalledWith(3000);

    instance!.unmount();
  });

  it('stops and resumes correctly', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(TimerWithControls, { interval: 1000 }),
      );
    });

    await advanceTimers(2000);
    let state = parseFrame(instance!.lastFrame());
    expect(state.elapsedMs).toBe(2000);

    // Stop
    await act(() => {
      instance!.rerender(
        React.createElement(TimerWithControls, { interval: 1000, action: 'stop' }),
      );
    });
    await advanceTimers(100);

    // Advance time while stopped
    await advanceTimers(3000);
    state = parseFrame(instance!.lastFrame());
    expect(state.isRunning).toBe(false);
    expect(state.elapsedMs).toBe(2000);

    // Resume
    await act(() => {
      instance!.rerender(
        React.createElement(TimerWithControls, { interval: 1000, action: 'start' }),
      );
    });
    await advanceTimers(100);

    await advanceTimers(2000);
    state = parseFrame(instance!.lastFrame());
    expect(state.isRunning).toBe(true);
    expect(state.elapsedMs).toBe(4000);

    instance!.unmount();
  });

  it('resets correctly', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(TimerWithControls, { interval: 1000 }),
      );
    });

    await advanceTimers(5000);
    let state = parseFrame(instance!.lastFrame());
    expect(state.elapsedMs).toBe(5000);

    // Reset
    await act(() => {
      instance!.rerender(
        React.createElement(TimerWithControls, { interval: 1000, action: 'reset' }),
      );
    });
    await advanceTimers(100);

    state = parseFrame(instance!.lastFrame());
    expect(state.elapsedMs).toBe(0);
    expect(state.isRunning).toBe(false);
    expect(state.text).toBe('00:00');

    instance!.unmount();
  });

  it('keeps ticks aligned to interval boundaries', async () => {
    const onTick = vi.fn();
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(TimerHarness, { interval: 1000, onTick }),
      );
    });

    // Ticks land on exact elapsed boundaries: 1000, 2000, 3000 — no drift,
    // no repeated or skipped values.
    await advanceTimers(3000);
    expect(onTick.mock.calls.map((c) => c[0])).toEqual([1000, 2000, 3000]);

    instance!.unmount();
  });

  it('adapts tick cadence when interval changes while running', async () => {
    const onTick = vi.fn();
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(TimerHarness, { interval: 1000, onTick }),
      );
    });

    await advanceTimers(2000);
    expect(onTick).toHaveBeenCalledTimes(2);

    // Switch to a 500ms interval; next boundaries are 2500, 3000, ...
    await act(() => {
      instance!.rerender(
        React.createElement(TimerHarness, { interval: 500, onTick }),
      );
    });

    await advanceTimers(1000);
    expect(onTick).toHaveBeenCalledTimes(4);
    expect(onTick).toHaveBeenLastCalledWith(3000);

    instance!.unmount();
  });

  it('re-aligns the next tick to the elapsed boundary after a non-boundary pause', async () => {
    const onTick = vi.fn();
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(TimerWithControls, { interval: 1000, onTick }),
      );
    });

    // Tick at 1000, then move to 1300 (a non-boundary offset) and pause.
    await advanceTimers(1000);
    await advanceTimers(300);
    await act(() => {
      instance!.rerender(
        React.createElement(TimerWithControls, { interval: 1000, onTick, action: 'stop' }),
      );
    });
    await advanceTimers(100);
    const ticksBefore = onTick.mock.calls.length;

    // Resume. Elapsed is 1300, so the next tick must land on the 2000 boundary
    // (700ms later), NOT at resume+1000 (which would be elapsed 2300). A fixed
    // setInterval would fire at resume+1000; the boundary scheduler fires at 700ms.
    await act(() => {
      instance!.rerender(
        React.createElement(TimerWithControls, { interval: 1000, onTick, action: 'start' }),
      );
    });

    await advanceTimers(699);
    expect(onTick.mock.calls.length).toBe(ticksBefore);

    await advanceTimers(1);
    expect(onTick.mock.calls.length).toBe(ticksBefore + 1);
    expect(onTick).toHaveBeenLastCalledWith(2000);

    instance!.unmount();
  });

  it('fires one tick per crossed boundary when advanced in a single step', async () => {
    // Fake-timer catch-up semantics: a single advanceTimersByTime that spans
    // multiple boundaries fires the callback once per boundary (5 ticks over
    // 5000ms), because each fired timeout synchronously schedules the next.
    const onTick = vi.fn();
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(TimerHarness, { interval: 1000, onTick }),
      );
    });

    await advanceTimers(5000);
    expect(onTick).toHaveBeenCalledTimes(5);
    expect(onTick.mock.calls.map((c) => c[0])).toEqual([1000, 2000, 3000, 4000, 5000]);

    instance!.unmount();
  });

  it('fires exactly one tick across a split advance straddling a boundary', async () => {
    const onTick = vi.fn();
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(TimerHarness, { interval: 1000, onTick }),
      );
    });

    await advanceTimers(999);
    expect(onTick).not.toHaveBeenCalled();
    await advanceTimers(2);
    expect(onTick).toHaveBeenCalledTimes(1);
    expect(onTick).toHaveBeenLastCalledWith(1000);

    instance!.unmount();
  });

  it('toggles between running and stopped', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(TimerWithControls, { interval: 1000 }),
      );
    });

    await advanceTimers(2000);
    let state = parseFrame(instance!.lastFrame());
    expect(state.isRunning).toBe(true);
    expect(state.elapsedMs).toBe(2000);

    // Toggle off
    await act(() => {
      instance!.rerender(
        React.createElement(TimerWithControls, { interval: 1000, action: 'toggle' }),
      );
    });
    await advanceTimers(100);

    state = parseFrame(instance!.lastFrame());
    expect(state.isRunning).toBe(false);

    instance!.unmount();
  });
});
