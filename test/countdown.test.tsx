import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { act } from 'react';
import { render } from 'ink-testing-library';
import { Countdown } from '../src/countdown/countdown.js';
import { advanceTimers } from './helpers.js';

describe('Countdown component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the initial countdown time', () => {
    const instance = render(
      React.createElement(Countdown, { duration: 60_000 }),
    );
    expect(instance.lastFrame()).toContain('01:00');
    instance.unmount();
  });

  it('counts down over time', async () => {
    const instance = render(
      React.createElement(Countdown, { duration: 10_000 }),
    );

    await advanceTimers(3000);
    expect(instance.lastFrame()).toContain('00:07');

    instance.unmount();
  });

  it('reaches zero and stops', async () => {
    const onComplete = vi.fn();
    const instance = render(
      React.createElement(Countdown, { duration: 5000, onComplete }),
    );

    await advanceTimers(5000);
    expect(instance.lastFrame()).toContain('00:00');
    expect(onComplete).toHaveBeenCalledTimes(1);

    instance.unmount();
  });

  it('renders prefix and suffix', () => {
    const instance = render(
      React.createElement(Countdown, {
        duration: 60_000,
        prefix: 'Time left: ',
        suffix: ' remaining',
      }),
    );

    expect(instance.lastFrame()).toContain('Time left: ');
    expect(instance.lastFrame()).toContain(' remaining');

    instance.unmount();
  });

  it('uses human format', async () => {
    const instance = render(
      React.createElement(Countdown, {
        duration: 150_000,
        format: 'human',
      }),
    );

    expect(instance.lastFrame()).toContain('2m 30s');

    await advanceTimers(30_000);
    expect(instance.lastFrame()).toContain('2m 0s');

    instance.unmount();
  });

  it('does not start when autoStart is false', async () => {
    const instance = render(
      React.createElement(Countdown, {
        duration: 10_000,
        autoStart: false,
      }),
    );

    await advanceTimers(5000);
    expect(instance.lastFrame()).toContain('00:10');

    instance.unmount();
  });

  it('responds to keyboard controls', async () => {
    const instance = render(
      React.createElement(Countdown, {
        duration: 10_000,
        enableKeyboard: true,
      }),
    );

    await advanceTimers(3000);
    expect(instance.lastFrame()).toContain('00:07');

    // Space to pause
    await act(() => {
      instance.stdin.write(' ');
    });
    await advanceTimers(100);

    await advanceTimers(5000);
    expect(instance.lastFrame()).toContain('00:07');

    // Space to resume
    await act(() => {
      instance.stdin.write(' ');
    });
    await advanceTimers(100);

    await advanceTimers(2000);
    expect(instance.lastFrame()).toContain('00:05');

    // R to reset
    await act(() => {
      instance.stdin.write('r');
    });
    await advanceTimers(100);

    expect(instance.lastFrame()).toContain('00:10');

    instance.unmount();
  });
});
