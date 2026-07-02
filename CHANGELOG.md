# Changelog

## 0.2.1 (2026-07-01)

### Bug Fixes
- Correct `peerDependencies` to `ink >=6.0.0` and `react >=19.0.0`. The
  components use Ink 6-only APIs (`useIsScreenReaderEnabled`, `aria-*` props),
  which crash on Ink 5.
- Schedule ticks to interval boundaries (and, for countdown, exactly to the
  deadline) instead of a fixed `setInterval`. `onComplete`/`isComplete` now
  fire at the deadline rather than up to one interval late, and displayed
  seconds no longer drift, repeat, or skip.
- `useCountdown`/`<Countdown>` now honor `autoStart` when the `duration` prop
  changes: it restarts from the new duration when `autoStart` is true instead
  of always pausing.
- Make dev-mode warnings (invalid interval, invalid duration, throwing custom
  format function) fire once per hook instance instead of once per process, so
  a second instance's distinct warning is no longer swallowed.

### Docs
- Note that the hooks are ink-free and only the components require Ink 6+.

### Internal
- Add an `xo` lint step and CI job.
- Add `"sideEffects": false`; drop dead `sourceMap`/`declarationMap` from
  tsconfig.

## 0.1.0 (2026-03-30)

### Features
- `useTimer` hook for elapsed time tracking
- `useCountdown` hook with completion detection
- `useStopwatch` hook with lap recording
- `<Timer>`, `<Countdown>`, `<Stopwatch>` display components
- Drift-free interval management using Date.now() anchors
- 4 format presets: digital, digital-ms, human, human-ms
- Custom format function support with error handling
- Keyboard controls (Space to pause/resume, R to reset, L for lap)
- `toggle()` and `restart()` convenience methods
- Dynamic duration changes for countdown
- Input validation with dev-mode warnings
