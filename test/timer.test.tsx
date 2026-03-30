import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { act } from 'react';
import { render } from 'ink-testing-library';
import { Timer } from '../src/timer/timer.js';
import { advanceTimers } from './helpers.js';

describe('Timer component', () => {
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
      instance = render(React.createElement(Timer, {}));
    });
    expect(instance!.lastFrame()).toContain('00:00');
    instance!.unmount();
  });

  it('updates the display as time passes', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(React.createElement(Timer, {}));
    });

    await advanceTimers(5000);
    expect(instance!.lastFrame()).toContain('00:05');

    instance!.unmount();
  });

  it('renders prefix and suffix', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(Timer, { prefix: 'Elapsed: ', suffix: ' elapsed' }),
      );
    });

    expect(instance!.lastFrame()).toContain('Elapsed: ');
    expect(instance!.lastFrame()).toContain(' elapsed');

    instance!.unmount();
  });

  it('uses human format when specified', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(Timer, { format: 'human' }),
      );
    });

    await advanceTimers(150_000);
    expect(instance!.lastFrame()).toContain('2m 30s');

    instance!.unmount();
  });

  it('uses digital-ms when showMilliseconds is true', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(Timer, { showMilliseconds: true }),
      );
    });

    await advanceTimers(1500);
    const frame = instance!.lastFrame();
    expect(frame).toContain('00:01');
    expect(frame).toMatch(/\d{2}:\d{2}\.\d{3}/);

    instance!.unmount();
  });

  it('does not start when autoStart is false', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(Timer, { autoStart: false }),
      );
    });

    await advanceTimers(5000);
    expect(instance!.lastFrame()).toContain('00:00');

    instance!.unmount();
  });

  it('responds to keyboard space for pause/resume', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(Timer, { enableKeyboard: true }),
      );
    });

    await advanceTimers(2000);
    expect(instance!.lastFrame()).toContain('00:02');

    // Press space to pause
    await act(() => {
      instance!.stdin.write(' ');
    });
    await advanceTimers(100);

    const pausedFrame = instance!.lastFrame();
    await advanceTimers(5000);
    expect(instance!.lastFrame()).toBe(pausedFrame);

    // Press space to resume
    await act(() => {
      instance!.stdin.write(' ');
    });
    await advanceTimers(100);

    await advanceTimers(1000);
    expect(instance!.lastFrame()).toContain('00:03');

    instance!.unmount();
  });

  it('responds to keyboard R for reset', async () => {
    let instance: ReturnType<typeof render>;
    await act(() => {
      instance = render(
        React.createElement(Timer, { enableKeyboard: true }),
      );
    });

    await advanceTimers(5000);
    expect(instance!.lastFrame()).toContain('00:05');

    // Press R to reset
    await act(() => {
      instance!.stdin.write('r');
    });
    await advanceTimers(100);

    expect(instance!.lastFrame()).toContain('00:00');

    instance!.unmount();
  });
});
