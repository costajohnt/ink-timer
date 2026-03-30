import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render } from 'ink-testing-library';
import { Text } from 'ink';
import { useInterval } from '../src/use-interval.js';
import { advanceTimers } from './helpers.js';

function IntervalTester({
  delay,
  onTick,
}: {
  delay: number | null;
  onTick: () => void;
}) {
  useInterval(onTick, delay);
  return React.createElement(Text, null, 'tester');
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
    const instance = render(
      React.createElement(IntervalTester, { delay: 1000, onTick }),
    );

    expect(onTick).not.toHaveBeenCalled();

    await advanceTimers(1000);
    expect(onTick).toHaveBeenCalledTimes(1);

    await advanceTimers(1000);
    expect(onTick).toHaveBeenCalledTimes(2);

    await advanceTimers(3000);
    expect(onTick).toHaveBeenCalledTimes(5);

    instance.unmount();
  });

  it('does not call callback when delay is null', async () => {
    const onTick = vi.fn();
    const instance = render(
      React.createElement(IntervalTester, { delay: null, onTick }),
    );

    await advanceTimers(5000);
    expect(onTick).not.toHaveBeenCalled();

    instance.unmount();
  });

  it('cleans up interval on unmount', async () => {
    const onTick = vi.fn();
    const instance = render(
      React.createElement(IntervalTester, { delay: 1000, onTick }),
    );

    await advanceTimers(2000);
    expect(onTick).toHaveBeenCalledTimes(2);

    instance.unmount();

    await advanceTimers(5000);
    expect(onTick).toHaveBeenCalledTimes(2);
  });

  it('stops calling when delay changes to null via rerender', async () => {
    const onTick = vi.fn();
    const instance = render(
      React.createElement(IntervalTester, { delay: 1000, onTick }),
    );

    await advanceTimers(2000);
    expect(onTick).toHaveBeenCalledTimes(2);

    instance.rerender(
      React.createElement(IntervalTester, { delay: null, onTick }),
    );

    await advanceTimers(5000);
    expect(onTick).toHaveBeenCalledTimes(2);

    instance.unmount();
  });

  it('adjusts when delay changes', async () => {
    const onTick = vi.fn();
    const instance = render(
      React.createElement(IntervalTester, { delay: 1000, onTick }),
    );

    await advanceTimers(2000);
    expect(onTick).toHaveBeenCalledTimes(2);

    instance.rerender(
      React.createElement(IntervalTester, { delay: 500, onTick }),
    );

    await advanceTimers(1000);
    expect(onTick).toHaveBeenCalledTimes(4);

    instance.unmount();
  });
});
