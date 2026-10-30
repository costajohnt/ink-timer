# Changelog

## [1.0.0](https://github.com/costajohnt/ink-timer/compare/v0.2.4...v1.0.0) (2026-10-30)


### ⚠ BREAKING CHANGES

* requires Node.js 22 or later.

### Features

* require Node.js 22 ([#18](https://github.com/costajohnt/ink-timer/issues/18)) ([74f7f46](https://github.com/costajohnt/ink-timer/commit/74f7f4642a186158473101d815040c2c8c090d4d))

## [0.2.4](https://github.com/costajohnt/ink-timer/compare/v0.2.3...v0.2.4) (2026-10-10)


### Bug Fixes

* **deps:** patch dev dependency advisories ([#13](https://github.com/costajohnt/ink-timer/issues/13)) ([4a5c617](https://github.com/costajohnt/ink-timer/commit/4a5c617ef4e9241b75fc6f8a0f114bac13ac7961))

## [0.2.3](https://github.com/costajohnt/ink-timer/compare/v0.2.2...v0.2.3) (2026-10-10)


### Bug Fixes

* round countdown remaining time up for second-resolution display ([#11](https://github.com/costajohnt/ink-timer/issues/11)) ([72a51e2](https://github.com/costajohnt/ink-timer/commit/72a51e223d4e8d220106ec6bec886c13260ae39b)), closes [#10](https://github.com/costajohnt/ink-timer/issues/10)

## [0.2.2](https://github.com/costajohnt/ink-timer/compare/v0.2.1...v0.2.2) (2026-07-24)


### Bug Fixes

* flush partial interval into elapsedMs/remainingMs on stop() ([cd47390](https://github.com/costajohnt/ink-timer/commit/cd4739075bcead0763a48ec9648f36fbd9cf442a)), closes [#7](https://github.com/costajohnt/ink-timer/issues/7)

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
- `useCountdown` no longer freezes when resumed at or past the deadline (e.g.
  paused right at 0 before the completion tick fired): it now completes
  immediately and fires `onComplete` instead of dropping it silently.
- Treat non-finite (`NaN`) `duration`/`interval` as invalid instead of falling
  through to a `setTimeout(0)` tight loop; they warn and clamp/complete.
- Make dev-mode warnings (invalid interval, invalid duration, throwing custom
  format function) fire once per hook instance instead of once per process, so
  a second instance's distinct warning is no longer swallowed.

### Docs
- Note that the hooks are ink-free and only the components require Ink 6+.

### Internal
- Add an `xo` lint step and CI job.
- Add `"sideEffects": false`; drop dead `sourceMap`/`declarationMap` from
  tsconfig.

## 0.2.0 (2026-03-31)

### Features
- Accessibility support for the display components: `<Timer>`, `<Countdown>`,
  and `<Stopwatch>` render an ARIA timer role with a live, human-readable time
  label (e.g. "2 minutes 30 seconds remaining, paused").
- Detect screen readers via Ink's `useIsScreenReaderEnabled` and append a
  spoken running/paused/complete state.
- Export the `buildAriaTimeDescription` helper.

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
