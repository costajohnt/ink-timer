# Changelog

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
