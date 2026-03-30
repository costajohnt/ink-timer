import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { act } from 'react';
import { render } from 'ink-testing-library';
import { Stopwatch } from '../src/stopwatch/stopwatch.js';
import { advanceTimers } from './helpers.js';

describe('Stopwatch component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the initial time', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(React.createElement(Stopwatch, {}));
    });
    expect(instance!.lastFrame()).toContain('00:00');
    instance!.unmount();
  });

  it('updates elapsed time', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(React.createElement(Stopwatch, {}));
    });

    await advanceTimers(5000);
    expect(instance!.lastFrame()).toContain('00:05');

    instance!.unmount();
  });

  it('renders prefix and suffix', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(Stopwatch, {
          prefix: 'Time: ',
          suffix: ' running',
        }),
      );
    });

    expect(instance!.lastFrame()).toContain('Time: ');
    expect(instance!.lastFrame()).toContain(' running');

    instance!.unmount();
  });

  it('shows laps when L key is pressed with keyboard enabled', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(Stopwatch, { enableKeyboard: true }),
      );
    });

    await advanceTimers(3000);

    // Press L to record a lap
    await act(() => {
      instance!.stdin.write('l');
    });
    await advanceTimers(100);

    const frame = instance!.lastFrame();
    expect(frame).toContain('Lap 1');

    instance!.unmount();
  });

  it('responds to space for pause/resume', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(Stopwatch, { enableKeyboard: true }),
      );
    });

    await advanceTimers(2000);
    expect(instance!.lastFrame()).toContain('00:02');

    // Pause
    await act(() => {
      instance!.stdin.write(' ');
    });
    await advanceTimers(100);

    await advanceTimers(5000);
    expect(instance!.lastFrame()).toContain('00:02');

    // Resume
    await act(() => {
      instance!.stdin.write(' ');
    });
    await advanceTimers(100);

    await advanceTimers(1000);
    expect(instance!.lastFrame()).toContain('00:03');

    instance!.unmount();
  });

  it('resets on R key press', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(Stopwatch, { enableKeyboard: true }),
      );
    });

    await advanceTimers(5000);
    expect(instance!.lastFrame()).toContain('00:05');

    await act(() => {
      instance!.stdin.write('r');
    });
    await advanceTimers(100);

    expect(instance!.lastFrame()).toContain('00:00');

    instance!.unmount();
  });

  it('hides laps when showLaps is false', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(Stopwatch, {
          enableKeyboard: true,
          showLaps: false,
        }),
      );
    });

    await advanceTimers(3000);
    await act(() => {
      instance!.stdin.write('l');
    });
    await advanceTimers(100);

    expect(instance!.lastFrame()).not.toContain('Lap');

    instance!.unmount();
  });

  it('limits displayed laps with maxLapsDisplay', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(Stopwatch, {
          enableKeyboard: true,
          maxLapsDisplay: 2,
        }),
      );
    });

    // Record 3 laps
    await advanceTimers(1000);
    await act(() => {
      instance!.stdin.write('l');
    });
    await advanceTimers(100);

    await advanceTimers(1000);
    await act(() => {
      instance!.stdin.write('l');
    });
    await advanceTimers(100);

    await advanceTimers(1000);
    await act(() => {
      instance!.stdin.write('l');
    });
    await advanceTimers(100);

    const frame = instance!.lastFrame()!;
    // Should show only the 2 most recent laps
    expect(frame).not.toContain('Lap 1');
    expect(frame).toContain('Lap 2');
    expect(frame).toContain('Lap 3');

    instance!.unmount();
  });

  it('does not record lap when L key is disabled', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(Stopwatch, {
          enableKeyboard: true,
          enableLapKey: false,
        }),
      );
    });

    await advanceTimers(3000);
    await act(() => {
      instance!.stdin.write('l');
    });
    await advanceTimers(100);

    expect(instance!.lastFrame()).not.toContain('Lap');

    instance!.unmount();
  });
});
