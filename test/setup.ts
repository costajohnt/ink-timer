globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Suppress the known "not wrapped in act()" warnings from ink-testing-library.
// These are triggered by Ink's internal renderer processing React state updates
// asynchronously, which is outside our control. All user-facing state updates
// in tests are properly wrapped in act() via the advanceTimers helper.
const originalError = console.error;
console.error = (...args: unknown[]) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (msg.includes('not wrapped in act')) return;
  originalError.apply(console, args);
};
