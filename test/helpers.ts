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
 */
export async function advanceTimers(ms: number): Promise<void> {
  await act(() => {
    vi.advanceTimersByTime(ms);
  });
}
