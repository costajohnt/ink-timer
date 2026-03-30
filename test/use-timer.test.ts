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
}: UseTimerOptions & { action?: 'start' | 'stop' | 'reset' }) {
  const timer = useTimer(options);

  React.useEffect(() => {
    if (action === 'start') timer.start();
    if (action === 'stop') timer.stop();
    if (action === 'reset') timer.reset();
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

  it('starts automatically by default', () => {
    const instance = render(React.createElement(TimerHarness, {}));
    const state = parseFrame(instance.lastFrame());
    expect(state.isRunning).toBe(true);
    expect(state.elapsedMs).toBe(0);
    instance.unmount();
  });

  it('does not start when autoStart is false', async () => {
    const instance = render(
      React.createElement(TimerHarness, { autoStart: false }),
    );
    const state = parseFrame(instance.lastFrame());
    expect(state.isRunning).toBe(false);

    await advanceTimers(5000);
    const state2 = parseFrame(instance.lastFrame());
    expect(state2.elapsedMs).toBe(0);

    instance.unmount();
  });

  it('tracks elapsed time on interval ticks', async () => {
    const instance = render(
      React.createElement(TimerHarness, { interval: 1000 }),
    );

    await advanceTimers(3000);
    const state = parseFrame(instance.lastFrame());
    expect(state.elapsedMs).toBe(3000);
    expect(state.text).toBe('00:03');

    instance.unmount();
  });

  it('formats elapsed time correctly', async () => {
    const instance = render(
      React.createElement(TimerHarness, { interval: 1000 }),
    );

    await advanceTimers(150_000);
    const state = parseFrame(instance.lastFrame());
    expect(state.text).toBe('02:30');

    instance.unmount();
  });

  it('respects custom format', async () => {
    const instance = render(
      React.createElement(TimerHarness, { interval: 1000, format: 'human' }),
    );

    await advanceTimers(150_000);
    const state = parseFrame(instance.lastFrame());
    expect(state.text).toBe('2m 30s');

    instance.unmount();
  });

  it('calls onTick on each interval', async () => {
    const onTick = vi.fn();
    const instance = render(
      React.createElement(TimerHarness, { interval: 1000, onTick }),
    );

    await advanceTimers(3000);
    expect(onTick).toHaveBeenCalledTimes(3);
    expect(onTick).toHaveBeenLastCalledWith(3000);

    instance.unmount();
  });

  it('stops and resumes correctly', async () => {
    const instance = render(
      React.createElement(TimerWithControls, { interval: 1000 }),
    );

    await advanceTimers(2000);
    let state = parseFrame(instance.lastFrame());
    expect(state.elapsedMs).toBe(2000);

    // Stop
    await act(() => {
      instance.rerender(
        React.createElement(TimerWithControls, { interval: 1000, action: 'stop' }),
      );
    });
    await advanceTimers(100);

    // Advance time while stopped
    await advanceTimers(3000);
    state = parseFrame(instance.lastFrame());
    expect(state.isRunning).toBe(false);
    expect(state.elapsedMs).toBe(2000);

    // Resume
    await act(() => {
      instance.rerender(
        React.createElement(TimerWithControls, { interval: 1000, action: 'start' }),
      );
    });
    await advanceTimers(100);

    await advanceTimers(2000);
    state = parseFrame(instance.lastFrame());
    expect(state.isRunning).toBe(true);
    expect(state.elapsedMs).toBe(4000);

    instance.unmount();
  });

  it('resets correctly', async () => {
    const instance = render(
      React.createElement(TimerWithControls, { interval: 1000 }),
    );

    await advanceTimers(5000);
    let state = parseFrame(instance.lastFrame());
    expect(state.elapsedMs).toBe(5000);

    // Reset
    await act(() => {
      instance.rerender(
        React.createElement(TimerWithControls, { interval: 1000, action: 'reset' }),
      );
    });
    await advanceTimers(100);

    state = parseFrame(instance.lastFrame());
    expect(state.elapsedMs).toBe(0);
    expect(state.isRunning).toBe(false);
    expect(state.text).toBe('00:00');

    instance.unmount();
  });
});
