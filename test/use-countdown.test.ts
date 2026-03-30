import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { act } from 'react';
import { render } from 'ink-testing-library';
import { Text } from 'ink';
import { useCountdown } from '../src/countdown/use-countdown.js';
import type { UseCountdownOptions } from '../src/types.js';
import { advanceTimers } from './helpers.js';

function CountdownHarness(
  props: UseCountdownOptions & { action?: 'start' | 'stop' | 'reset' },
) {
  const { action, ...options } = props;
  const cd = useCountdown(options);

  React.useEffect(() => {
    if (action === 'start') cd.start();
    if (action === 'stop') cd.stop();
    if (action === 'reset') cd.reset();
  }, [action]);

  return React.createElement(
    Text,
    null,
    JSON.stringify({
      remainingMs: cd.remainingMs,
      isRunning: cd.isRunning,
      isComplete: cd.isComplete,
      text: cd.formatted.text,
    }),
  );
}

function parseFrame(frame: string | undefined) {
  return JSON.parse(frame ?? '{}') as {
    remainingMs: number;
    isRunning: boolean;
    isComplete: boolean;
    text: string;
  };
}

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with the full duration', () => {
    const instance = render(
      React.createElement(CountdownHarness, { duration: 10_000 }),
    );
    const state = parseFrame(instance.lastFrame());
    expect(state.remainingMs).toBe(10_000);
    expect(state.isRunning).toBe(true);
    expect(state.isComplete).toBe(false);
    expect(state.text).toBe('00:10');
    instance.unmount();
  });

  it('counts down over time', async () => {
    const instance = render(
      React.createElement(CountdownHarness, {
        duration: 10_000,
        interval: 1000,
      }),
    );

    await advanceTimers(3000);
    const state = parseFrame(instance.lastFrame());
    expect(state.remainingMs).toBe(7000);
    expect(state.text).toBe('00:07');

    instance.unmount();
  });

  it('clamps remaining to zero and fires onComplete', async () => {
    const onComplete = vi.fn();
    const instance = render(
      React.createElement(CountdownHarness, {
        duration: 5000,
        interval: 1000,
        onComplete,
      }),
    );

    await advanceTimers(5000);
    const state = parseFrame(instance.lastFrame());
    expect(state.remainingMs).toBe(0);
    expect(state.isComplete).toBe(true);
    expect(state.isRunning).toBe(false);
    expect(onComplete).toHaveBeenCalledTimes(1);

    instance.unmount();
  });

  it('fires onComplete exactly once even with extra ticks', async () => {
    const onComplete = vi.fn();
    const instance = render(
      React.createElement(CountdownHarness, {
        duration: 3000,
        interval: 1000,
        onComplete,
      }),
    );

    await advanceTimers(10_000);
    expect(onComplete).toHaveBeenCalledTimes(1);

    instance.unmount();
  });

  it('does not go below zero', async () => {
    const instance = render(
      React.createElement(CountdownHarness, {
        duration: 3000,
        interval: 1000,
      }),
    );

    await advanceTimers(10_000);
    const state = parseFrame(instance.lastFrame());
    expect(state.remainingMs).toBe(0);
    expect(state.text).toBe('00:00');

    instance.unmount();
  });

  it('does not start when autoStart is false', async () => {
    const instance = render(
      React.createElement(CountdownHarness, {
        duration: 10_000,
        autoStart: false,
      }),
    );

    await advanceTimers(5000);
    const state = parseFrame(instance.lastFrame());
    expect(state.remainingMs).toBe(10_000);
    expect(state.isRunning).toBe(false);

    instance.unmount();
  });

  it('calls onTick with remaining ms', async () => {
    const onTick = vi.fn();
    const instance = render(
      React.createElement(CountdownHarness, {
        duration: 10_000,
        interval: 1000,
        onTick,
      }),
    );

    await advanceTimers(3000);
    expect(onTick).toHaveBeenCalledTimes(3);
    expect(onTick).toHaveBeenLastCalledWith(7000);

    instance.unmount();
  });

  it('can pause and resume', async () => {
    const instance = render(
      React.createElement(CountdownHarness, {
        duration: 10_000,
        interval: 1000,
      }),
    );

    await advanceTimers(3000);
    let state = parseFrame(instance.lastFrame());
    expect(state.remainingMs).toBe(7000);

    // Stop
    await act(() => {
      instance.rerender(
        React.createElement(CountdownHarness, {
          duration: 10_000,
          interval: 1000,
          action: 'stop',
        }),
      );
    });
    await advanceTimers(100);

    await advanceTimers(5000);
    state = parseFrame(instance.lastFrame());
    expect(state.remainingMs).toBe(7000);

    // Resume
    await act(() => {
      instance.rerender(
        React.createElement(CountdownHarness, {
          duration: 10_000,
          interval: 1000,
          action: 'start',
        }),
      );
    });
    await advanceTimers(100);

    await advanceTimers(2000);
    state = parseFrame(instance.lastFrame());
    expect(state.remainingMs).toBe(5000);

    instance.unmount();
  });

  it('resets correctly', async () => {
    const onComplete = vi.fn();
    const instance = render(
      React.createElement(CountdownHarness, {
        duration: 5000,
        interval: 1000,
        onComplete,
      }),
    );

    // Complete the countdown
    await advanceTimers(5000);
    let state = parseFrame(instance.lastFrame());
    expect(state.isComplete).toBe(true);
    expect(onComplete).toHaveBeenCalledTimes(1);

    // Reset
    await act(() => {
      instance.rerender(
        React.createElement(CountdownHarness, {
          duration: 5000,
          interval: 1000,
          onComplete,
          action: 'reset',
        }),
      );
    });
    await advanceTimers(100);

    state = parseFrame(instance.lastFrame());
    expect(state.remainingMs).toBe(5000);
    expect(state.isComplete).toBe(false);
    expect(state.isRunning).toBe(false);

    instance.unmount();
  });
});
