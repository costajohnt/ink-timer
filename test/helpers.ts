/**
 * Shared test utilities.
 *
 * We use fake timers throughout. With React 19 + Ink 6, state updates from
 * interval callbacks must be flushed via act(). We wrap vi.advanceTimersByTime
 * in act() to ensure React processes all pending state updates.
 */
import { act } from 'react';
import { vi } from 'vitest';

/**
 * Advance fake timers and flush React state updates.
 *
 * The act() callback is async and drains the microtask queue after advancing
 * the timers, so any state updates queued by timer callbacks (and Ink's async
 * renderer) are committed before the assertion runs. A purely synchronous
 * advance can otherwise leave those updates pending under CPU contention,
 * making timing assertions flaky on slower/older runtimes.
 */
export async function advanceTimers(ms: number): Promise<void> {
  await act(async () => {
    vi.advanceTimersByTime(ms);
    await Promise.resolve();
  });
}
