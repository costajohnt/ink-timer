import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { act } from 'react';
import { render } from 'ink-testing-library';
import { Text } from 'ink';
import { useCountdown } from '../src/countdown/use-countdown.js';
import type { UseCountdownOptions } from '../src/types.js';
import { advanceTimers } from './helpers.js';

function CountdownHarness(
  props: UseCountdownOptions & { action?: 'start' | 'stop' | 'reset' | 'toggle' | 'restart' },
) {
  const { action, ...options } = props;
  const cd = useCountdown(options);

  React.useEffect(() => {
    if (action === 'start') cd.start();
    if (action === 'stop') cd.stop();
    if (action === 'reset') cd.reset();
    if (action === 'toggle') cd.toggle();
    if (action === 'restart') cd.restart();
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

  it('starts with the full duration', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(CountdownHarness, { duration: 10_000 }),
      );
    });
    const state = parseFrame(instance!.lastFrame());
    expect(state.remainingMs).toBe(10_000);
    expect(state.isRunning).toBe(true);
    expect(state.isComplete).toBe(false);
    expect(state.text).toBe('00:10');
    instance!.unmount();
  });

  it('counts down over time', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(CountdownHarness, {
          duration: 10_000,
          interval: 1000,
        }),
      );
    });

    await advanceTimers(3000);
    const state = parseFrame(instance!.lastFrame());
    expect(state.remainingMs).toBe(7000);
    expect(state.text).toBe('00:07');

    instance!.unmount();
  });

  it('clamps remaining to zero and fires onComplete', async () => {
    const onComplete = vi.fn();
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(CountdownHarness, {
          duration: 5000,
          interval: 1000,
          onComplete,
        }),
      );
    });

    await advanceTimers(5000);
    const state = parseFrame(instance!.lastFrame());
    expect(state.remainingMs).toBe(0);
    expect(state.isComplete).toBe(true);
    expect(state.isRunning).toBe(false);
    expect(onComplete).toHaveBeenCalledTimes(1);

    instance!.unmount();
  });

  it('fires onComplete exactly once even with extra ticks', async () => {
    const onComplete = vi.fn();
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(CountdownHarness, {
          duration: 3000,
          interval: 1000,
          onComplete,
        }),
      );
    });

    await advanceTimers(10_000);
    expect(onComplete).toHaveBeenCalledTimes(1);

    instance!.unmount();
  });

  it('does not go below zero', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(CountdownHarness, {
          duration: 3000,
          interval: 1000,
        }),
      );
    });

    await advanceTimers(10_000);
    const state = parseFrame(instance!.lastFrame());
    expect(state.remainingMs).toBe(0);
    expect(state.text).toBe('00:00');

    instance!.unmount();
  });

  it('does not start when autoStart is false', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(CountdownHarness, {
          duration: 10_000,
          autoStart: false,
        }),
      );
    });

    await advanceTimers(5000);
    const state = parseFrame(instance!.lastFrame());
    expect(state.remainingMs).toBe(10_000);
    expect(state.isRunning).toBe(false);

    instance!.unmount();
  });

  it('calls onTick with remaining ms', async () => {
    const onTick = vi.fn();
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(CountdownHarness, {
          duration: 10_000,
          interval: 1000,
          onTick,
        }),
      );
    });

    await advanceTimers(3000);
    expect(onTick).toHaveBeenCalledTimes(3);
    expect(onTick).toHaveBeenLastCalledWith(7000);

    instance!.unmount();
  });

  it('can pause and resume', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(CountdownHarness, {
          duration: 10_000,
          interval: 1000,
        }),
      );
    });

    await advanceTimers(3000);
    let state = parseFrame(instance!.lastFrame());
    expect(state.remainingMs).toBe(7000);

    // Stop
    await act(() => {
      instance!.rerender(
        React.createElement(CountdownHarness, {
          duration: 10_000,
          interval: 1000,
          action: 'stop',
        }),
      );
    });
    await advanceTimers(100);

    await advanceTimers(5000);
    state = parseFrame(instance!.lastFrame());
    expect(state.remainingMs).toBe(7000);

    // Resume
    await act(() => {
      instance!.rerender(
        React.createElement(CountdownHarness, {
          duration: 10_000,
          interval: 1000,
          action: 'start',
        }),
      );
    });
    await advanceTimers(100);

    await advanceTimers(2000);
    state = parseFrame(instance!.lastFrame());
    expect(state.remainingMs).toBe(5000);

    instance!.unmount();
  });

  it('resets correctly', async () => {
    const onComplete = vi.fn();
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(CountdownHarness, {
          duration: 5000,
          interval: 1000,
          onComplete,
        }),
      );
    });

    // Complete the countdown
    await advanceTimers(5000);
    let state = parseFrame(instance!.lastFrame());
    expect(state.isComplete).toBe(true);
    expect(onComplete).toHaveBeenCalledTimes(1);

    // Reset
    await act(() => {
      instance!.rerender(
        React.createElement(CountdownHarness, {
          duration: 5000,
          interval: 1000,
          onComplete,
          action: 'reset',
        }),
      );
    });
    await advanceTimers(100);

    state = parseFrame(instance!.lastFrame());
    expect(state.remainingMs).toBe(5000);
    expect(state.isComplete).toBe(false);
    expect(state.isRunning).toBe(false);

    instance!.unmount();
  });

  it('warns on invalid duration (<= 0)', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(CountdownHarness, { duration: -1000 }),
      );
    });
    const state = parseFrame(instance!.lastFrame());
    expect(state.remainingMs).toBe(0);
    expect(state.isComplete).toBe(true);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('useCountdown received duration=-1000'),
    );
    warnSpy.mockRestore();
    instance!.unmount();
  });

  it('resets and keeps running from the new duration when autoStart (default)', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(CountdownHarness, {
          duration: 10_000,
          interval: 1000,
        }),
      );
    });

    await advanceTimers(3000);
    let state = parseFrame(instance!.lastFrame());
    expect(state.remainingMs).toBe(7000);

    // Change duration; autoStart defaults to true, so it should restart running.
    await act(() => {
      instance!.rerender(
        React.createElement(CountdownHarness, {
          duration: 20_000,
          interval: 1000,
        }),
      );
    });
    await advanceTimers(100);

    state = parseFrame(instance!.lastFrame());
    expect(state.remainingMs).toBe(20_000);
    expect(state.isRunning).toBe(true);
    expect(state.isComplete).toBe(false);

    // Continues counting down from the new duration.
    await advanceTimers(2000);
    state = parseFrame(instance!.lastFrame());
    expect(state.remainingMs).toBe(18_000);
    expect(state.isRunning).toBe(true);

    instance!.unmount();
  });

  it('resets to a stopped state on duration change when autoStart is false', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(CountdownHarness, {
          duration: 10_000,
          interval: 1000,
          autoStart: false,
          action: 'start',
        }),
      );
    });

    await advanceTimers(3000);
    let state = parseFrame(instance!.lastFrame());
    expect(state.remainingMs).toBe(7000);
    expect(state.isRunning).toBe(true);

    // Change duration; autoStart is false, so it should reset and stay stopped.
    await act(() => {
      instance!.rerender(
        React.createElement(CountdownHarness, {
          duration: 20_000,
          interval: 1000,
          autoStart: false,
        }),
      );
    });
    await advanceTimers(5000);

    state = parseFrame(instance!.lastFrame());
    expect(state.remainingMs).toBe(20_000);
    expect(state.isRunning).toBe(false);
    expect(state.isComplete).toBe(false);

    instance!.unmount();
  });

  it('toggle switches between running and stopped', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(CountdownHarness, {
          duration: 10_000,
          interval: 1000,
        }),
      );
    });

    await advanceTimers(2000);
    let state = parseFrame(instance!.lastFrame());
    expect(state.isRunning).toBe(true);

    // Toggle off
    await act(() => {
      instance!.rerender(
        React.createElement(CountdownHarness, {
          duration: 10_000,
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

  it('restart resets and starts immediately', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(CountdownHarness, {
          duration: 10_000,
          interval: 1000,
        }),
      );
    });

    await advanceTimers(5000);
    let state = parseFrame(instance!.lastFrame());
    expect(state.remainingMs).toBe(5000);

    // Restart
    await act(() => {
      instance!.rerender(
        React.createElement(CountdownHarness, {
          duration: 10_000,
          interval: 1000,
          action: 'restart',
        }),
      );
    });
    await advanceTimers(100);

    state = parseFrame(instance!.lastFrame());
    expect(state.isRunning).toBe(true);
    expect(state.isComplete).toBe(false);
    // After restart + 100ms tick, remaining should be close to 10_000
    expect(state.remainingMs).toBeGreaterThanOrEqual(9000);

    instance!.unmount();
  });

  describe('deadline-aligned scheduling', () => {
    it('fires onComplete exactly at the deadline, not the next interval boundary', async () => {
      const onComplete = vi.fn();
      let instance: ReturnType<typeof render>;
      await act(() => {
        instance = render(
          React.createElement(CountdownHarness, {
            duration: 1500,
            interval: 1000,
            onComplete,
          }),
        );
      });

      // At the first interval boundary (t=1000) it is still counting the
      // final partial second — not yet complete.
      await advanceTimers(1000);
      let state = parseFrame(instance!.lastFrame());
      expect(state.isRunning).toBe(true);
      expect(state.isComplete).toBe(false);
      expect(onComplete).not.toHaveBeenCalled();

      // The deadline tick fires at t=1500 (not the t=2000 boundary).
      await advanceTimers(500);
      state = parseFrame(instance!.lastFrame());
      expect(state.remainingMs).toBe(0);
      expect(state.isComplete).toBe(true);
      expect(state.isRunning).toBe(false);
      expect(onComplete).toHaveBeenCalledTimes(1);

      instance!.unmount();
    });

    it('has no stale 00:00-while-running window past the deadline', async () => {
      let instance: ReturnType<typeof render>;
      await act(() => {
        instance = render(
          React.createElement(CountdownHarness, {
            duration: 1500,
            interval: 1000,
          }),
        );
      });

      // Advance past the deadline but before the old (buggy) t=2000 boundary.
      await advanceTimers(1600);
      const state = parseFrame(instance!.lastFrame());
      // Already complete and stopped — never "00:00 while still running".
      expect(state.isComplete).toBe(true);
      expect(state.isRunning).toBe(false);
      expect(state.remainingMs).toBe(0);

      instance!.unmount();
    });

    it('fires onComplete exactly once even after the deadline passes', async () => {
      const onComplete = vi.fn();
      let instance: ReturnType<typeof render>;
      await act(() => {
        instance = render(
          React.createElement(CountdownHarness, {
            duration: 1500,
            interval: 1000,
            onComplete,
          }),
        );
      });

      await advanceTimers(10_000);
      const state = parseFrame(instance!.lastFrame());
      expect(state.isComplete).toBe(true);
      expect(onComplete).toHaveBeenCalledTimes(1);

      instance!.unmount();
    });

    it('completes exactly at the deadline after pausing across a boundary', async () => {
      const onComplete = vi.fn();
      let instance: ReturnType<typeof render>;
      // Duration 4500 with a 1000ms interval: the deadline (4500) does NOT
      // coincide with an interval boundary, so a fixed setInterval would
      // complete late at 5000 — this test discriminates the two.
      await act(() => {
        instance = render(
          React.createElement(CountdownHarness, {
            duration: 4500,
            interval: 1000,
            onComplete,
          }),
        );
      });

      // Run 2s, remaining 2500.
      await advanceTimers(2000);
      let state = parseFrame(instance!.lastFrame());
      expect(state.remainingMs).toBe(2500);

      // Pause and let a lot of wall-clock pass; elapsed must not advance.
      await act(() => {
        instance!.rerender(
          React.createElement(CountdownHarness, {
            duration: 4500,
            interval: 1000,
            onComplete,
            action: 'stop',
          }),
        );
      });
      await advanceTimers(10_000);
      state = parseFrame(instance!.lastFrame());
      expect(state.remainingMs).toBe(2500);
      expect(state.isRunning).toBe(false);

      // Resume and run the remaining 2.5s; completes exactly at the deadline
      // (4500ms elapsed), not at the next 1000ms boundary (5000ms).
      await act(() => {
        instance!.rerender(
          React.createElement(CountdownHarness, {
            duration: 4500,
            interval: 1000,
            onComplete,
            action: 'start',
          }),
        );
      });
      await advanceTimers(2500);
      state = parseFrame(instance!.lastFrame());
      expect(state.remainingMs).toBe(0);
      expect(state.isComplete).toBe(true);
      expect(onComplete).toHaveBeenCalledTimes(1);

      instance!.unmount();
    });

    it('completes on resume when paused at/after the deadline', async () => {
      const onComplete = vi.fn();
      let instance: ReturnType<typeof render>;
      await act(() => {
        instance = render(
          React.createElement(CountdownHarness, {
            duration: 3000,
            interval: 1000,
            onComplete,
          }),
        );
      });

      // Run 1s (remaining 2000).
      await advanceTimers(1000);

      // Simulate the event loop being blocked past the deadline: jump the
      // clock WITHOUT firing the pending timers, then pause. stop() banks
      // elapsed that now exceeds the duration while the completion tick never
      // ran, so completeFired is still false.
      await act(() => {
        vi.setSystemTime(new Date('2026-01-01T00:00:05.000Z'));
        instance!.rerender(
          React.createElement(CountdownHarness, {
            duration: 3000,
            interval: 1000,
            onComplete,
            action: 'stop',
          }),
        );
      });
      let state = parseFrame(instance!.lastFrame());
      expect(state.isComplete).toBe(false);
      expect(onComplete).not.toHaveBeenCalled();

      // Resume: must complete immediately, not freeze forever with onComplete
      // silently dropped.
      await act(() => {
        instance!.rerender(
          React.createElement(CountdownHarness, {
            duration: 3000,
            interval: 1000,
            onComplete,
            action: 'start',
          }),
        );
      });
      await advanceTimers(100);

      state = parseFrame(instance!.lastFrame());
      expect(state.isComplete).toBe(true);
      expect(state.isRunning).toBe(false);
      expect(state.remainingMs).toBe(0);
      expect(onComplete).toHaveBeenCalledTimes(1);

      instance!.unmount();
    });
  });

  describe('edge-case input handling', () => {
    it('does not fire onComplete when duration is changed to 0 dynamically', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const onComplete = vi.fn();
      let instance: ReturnType<typeof render>;
      await act(() => {
        instance = render(
          React.createElement(CountdownHarness, {
            duration: 10_000,
            interval: 1000,
            onComplete,
          }),
        );
      });

      await advanceTimers(3000);

      // Changing duration to 0 marks the countdown complete (a reset to an
      // already-elapsed state) but does NOT invoke onComplete, which is
      // reserved for actually counting down to zero.
      await act(() => {
        instance!.rerender(
          React.createElement(CountdownHarness, {
            duration: 0,
            interval: 1000,
            onComplete,
          }),
        );
      });
      await advanceTimers(100);

      const state = parseFrame(instance!.lastFrame());
      expect(state.remainingMs).toBe(0);
      expect(state.isComplete).toBe(true);
      expect(state.isRunning).toBe(false);
      expect(onComplete).not.toHaveBeenCalled();

      warnSpy.mockRestore();
      instance!.unmount();
    });

    it('treats a non-finite (NaN) duration as invalid and completes immediately', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      let instance: ReturnType<typeof render>;
      await act(() => {
        instance = render(
          React.createElement(CountdownHarness, { duration: Number.NaN }),
        );
      });

      // No tight loop: advancing time must not accumulate elapsed.
      await advanceTimers(5000);
      const state = parseFrame(instance!.lastFrame());
      expect(state.remainingMs).toBe(0);
      expect(state.isComplete).toBe(true);
      expect(state.isRunning).toBe(false);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('useCountdown received duration=NaN'),
      );
      warnSpy.mockRestore();
      instance!.unmount();
    });
  });
});
