# ink-timer

[![npm version](https://img.shields.io/npm/v/ink-timer.svg)](https://www.npmjs.com/package/ink-timer)
[![CI](https://img.shields.io/github/actions/workflow/status/costajohnt/ink-timer/ci.yml?branch=master&label=CI)](https://github.com/costajohnt/ink-timer/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/ink-timer.svg)](https://github.com/costajohnt/ink-timer/blob/master/LICENSE)

<p align="center">
  <img src="media/demo.gif" alt="ink-timer demo" width="600">
</p>

Timer, countdown, and stopwatch hooks and components for [Ink](https://github.com/vadimdemedes/ink).

## Features

- **Timer** counts up from zero with start/stop/reset controls
- **Countdown** counts down from a given duration and fires a callback on completion
- **Stopwatch** counts up with lap recording and lap history
- Four built-in format presets plus custom format functions
- Keyboard controls out of the box (pause, resume, reset, lap)
- Designed for React 18+ and Ink 5+
- Full TypeScript types exported

## Install

```
npm install ink-timer
```

Peer dependencies: `react` (>=18) and `ink` (>=5).

## Quick Start

### Timer

```tsx
import { render } from 'ink';
import { Timer } from 'ink-timer';

render(<Timer prefix="Elapsed: " format="human" enableKeyboard />);
// Elapsed: 0s
// Elapsed: 1s
// Elapsed: 2s ...
```

### Countdown

```tsx
import { render } from 'ink';
import { Countdown } from 'ink-timer';

render(
  <Countdown
    duration={30_000}
    prefix="Remaining: "
    color="yellow"
    onComplete={() => console.log('Done!')}
  />
);
// Remaining: 00:30
// Remaining: 00:29 ...
```

### Stopwatch

```tsx
import { render } from 'ink';
import { Stopwatch } from 'ink-timer';

render(
  <Stopwatch enableKeyboard showLaps maxLapsDisplay={5} color="cyan" />
);
// 00:00
// (press L to record laps)
```

## Hooks API

### `useTimer(options?)`

A hook that counts elapsed time upward.

#### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `autoStart` | `boolean` | `true` | Start the timer immediately on mount |
| `interval` | `number` | `1000` | Update interval in milliseconds |
| `onTick` | `(elapsedMs: number) => void` | - | Callback fired on every interval tick while running |
| `format` | `FormatOption` | `"digital"` | Format preset name or custom format function |

#### Returns `UseTimerResult`

| Property | Type | Description |
|---|---|---|
| `elapsedMs` | `number` | Elapsed time in milliseconds since start (excluding paused periods) |
| `isRunning` | `boolean` | Whether the timer is currently running |
| `formatted` | `FormattedTime` | Formatted time breakdown (see below) |
| `start` | `() => void` | Start or resume the timer. No-op if already running |
| `stop` | `() => void` | Pause the timer. No-op if not running |
| `reset` | `() => void` | Reset to 0 and stop |
| `toggle` | `() => void` | Toggle between running and stopped |

---

### `useCountdown(options)`

A hook that counts down from a given duration.

#### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `duration` | `number` | **required** | Total countdown duration in milliseconds |
| `autoStart` | `boolean` | `true` | Start counting down immediately on mount |
| `interval` | `number` | `1000` | Update interval in milliseconds |
| `onTick` | `(remainingMs: number) => void` | - | Callback fired on every interval tick while running |
| `onComplete` | `() => void` | - | Callback fired exactly once when the countdown reaches 0 |
| `format` | `FormatOption` | `"digital"` | Format preset name or custom format function |

#### Returns `UseCountdownResult`

| Property | Type | Description |
|---|---|---|
| `remainingMs` | `number` | Remaining time in milliseconds (clamped to >= 0) |
| `isRunning` | `boolean` | Whether the countdown is currently running |
| `isComplete` | `boolean` | Whether the countdown has reached 0 |
| `formatted` | `FormattedTime` | Formatted time breakdown of remaining time |
| `start` | `() => void` | Start or resume. No-op if already running or complete |
| `stop` | `() => void` | Pause. No-op if not running |
| `reset` | `() => void` | Reset to the original duration and stop |
| `toggle` | `() => void` | Toggle between running and stopped |
| `restart` | `() => void` | Reset and immediately start |

---

### `useStopwatch(options?)`

A hook that counts elapsed time upward with lap recording.

#### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `autoStart` | `boolean` | `true` | Start the stopwatch immediately on mount |
| `interval` | `number` | `1000` | Update interval in milliseconds |
| `onTick` | `(elapsedMs: number) => void` | - | Callback fired on every interval tick while running |
| `onLap` | `(lap: Lap) => void` | - | Callback fired when a new lap is recorded |
| `format` | `FormatOption` | `"digital"` | Format preset name or custom format function |

#### Returns `UseStopwatchResult`

| Property | Type | Description |
|---|---|---|
| `elapsedMs` | `number` | Total elapsed time in milliseconds (excluding paused periods) |
| `isRunning` | `boolean` | Whether the stopwatch is currently running |
| `laps` | `readonly Lap[]` | Array of recorded laps in chronological order |
| `formatted` | `FormattedTime` | Formatted time breakdown |
| `start` | `() => void` | Start or resume. No-op if already running |
| `stop` | `() => void` | Pause. No-op if not running |
| `reset` | `() => void` | Reset to 0, clear all laps, and stop |
| `toggle` | `() => void` | Toggle between running and stopped |
| `lap` | `() => void` | Record a lap. Only works while running |

#### `Lap`

| Property | Type | Description |
|---|---|---|
| `number` | `number` | 1-indexed lap number |
| `durationMs` | `number` | Duration of this individual lap in milliseconds |
| `cumulativeMs` | `number` | Cumulative elapsed time at the moment this lap was recorded |
| `formatted` | `FormattedTime` | Formatted breakdown of this lap's duration |

> **Note:** Each lap's `formatted` field is a snapshot created at recording time using the format option that was active when the lap was recorded. If you change the format option after recording laps, previously recorded laps retain their original formatting.

---

### `FormattedTime`

Returned by the `formatted` field of every hook.

| Property | Type | Description |
|---|---|---|
| `text` | `string` | Pre-formatted display string based on the active format option |
| `hours` | `number` | Whole hours component |
| `minutes` | `number` | Whole minutes component (0-59) |
| `seconds` | `number` | Whole seconds component (0-59) |
| `milliseconds` | `number` | Remaining milliseconds component (0-999) |
| `totalMs` | `number` | Total elapsed or remaining time in milliseconds |

## Components API

### `<Timer>`

Renders a timer display that counts up.

| Prop | Type | Default | Description |
|---|---|---|---|
| `autoStart` | `boolean` | `true` | Start automatically on mount |
| `interval` | `number` | `1000` | Update interval in milliseconds |
| `format` | `FormatOption` | `"digital"` | Format preset or custom format function |
| `showMilliseconds` | `boolean` | `false` | Shorthand to switch to `"digital-ms"` format preset |
| `prefix` | `string` | - | Text to render before the time string |
| `suffix` | `string` | - | Text to render after the time string |
| `color` | `string` | - | Text color (any value supported by Ink's `<Text color>`) |
| `bold` | `boolean` | `false` | Render time text in bold |
| `dimWhenPaused` | `boolean` | `true` | Dim the time text when paused |
| `enableKeyboard` | `boolean` | `false` | Enable keyboard controls |
| `onTick` | `(elapsedMs: number) => void` | - | Callback fired every tick |

### `<Countdown>`

Renders a countdown display.

| Prop | Type | Default | Description |
|---|---|---|---|
| `duration` | `number` | **required** | Total countdown duration in milliseconds |
| `autoStart` | `boolean` | `true` | Start automatically on mount |
| `interval` | `number` | `1000` | Update interval in milliseconds |
| `format` | `FormatOption` | `"digital"` | Format preset or custom format function |
| `showMilliseconds` | `boolean` | `false` | Shorthand to switch to `"digital-ms"` format preset |
| `prefix` | `string` | - | Text to render before the time string |
| `suffix` | `string` | - | Text to render after the time string |
| `color` | `string` | - | Text color |
| `bold` | `boolean` | `false` | Render time text in bold |
| `dimWhenPaused` | `boolean` | `true` | Dim the time text when paused |
| `enableKeyboard` | `boolean` | `false` | Enable keyboard controls |
| `onTick` | `(remainingMs: number) => void` | - | Callback fired every tick |
| `onComplete` | `() => void` | - | Callback fired when countdown reaches 0 |

### `<Stopwatch>`

Renders a stopwatch display with optional lap list.

| Prop | Type | Default | Description |
|---|---|---|---|
| `autoStart` | `boolean` | `true` | Start automatically on mount |
| `interval` | `number` | `1000` | Update interval in milliseconds |
| `format` | `FormatOption` | `"digital"` | Format preset or custom format function |
| `showMilliseconds` | `boolean` | `false` | Shorthand to switch to `"digital-ms"` format preset |
| `prefix` | `string` | - | Text to render before the time string |
| `suffix` | `string` | - | Text to render after the time string |
| `color` | `string` | - | Text color |
| `bold` | `boolean` | `false` | Render time text in bold |
| `dimWhenPaused` | `boolean` | `true` | Dim the time text when paused |
| `enableKeyboard` | `boolean` | `false` | Enable keyboard controls |
| `onTick` | `(elapsedMs: number) => void` | - | Callback fired every tick |
| `onLap` | `(lap: Lap) => void` | - | Callback fired when a lap is recorded |
| `showLaps` | `boolean` | `true` | Show lap list below the elapsed time |
| `maxLapsDisplay` | `number` | `0` | Maximum laps to display (most recent first). 0 = unlimited |
| `enableLapKey` | `boolean` | `true` | Enable the L key for recording laps (only when `enableKeyboard` is true) |

## Format Options

### Built-in Presets

#### `"digital"` (default)

Minutes and seconds, with hours added automatically when needed.

```
0s     -> 00:00
5s     -> 00:05
2m 30s -> 02:30
1h 1m  -> 1:01:01
```

#### `"digital-ms"`

Same as `"digital"` but with milliseconds appended.

```
0s          -> 00:00.000
2m 30.45s   -> 02:30.450
1h 1m 1.12s -> 1:01:01.123
```

#### `"human"`

Human-readable short units.

```
0s     -> 0s
5s     -> 5s
2m 30s -> 2m 30s
1h 1m  -> 1h 1m 1s
```

#### `"human-ms"`

Same as `"human"` but with milliseconds appended.

```
0s          -> 0s 0ms
2m 30.45s   -> 2m 30s 450ms
1h 1m 1.12s -> 1h 1m 1s 123ms
```

### Custom Format Function

Pass a function that receives milliseconds and returns a string.

```tsx
<Timer
  format={(ms) => `${Math.floor(ms / 1000)} seconds`}
/>
// 0 seconds
// 1 seconds
// 2 seconds ...
```

The `formatted` object still provides numeric `hours`, `minutes`, `seconds`, and `milliseconds` components regardless of the format function.

## Keyboard Controls

When `enableKeyboard` is set to `true`, the following keys are active:

| Key | Action | Components |
|---|---|---|
| `Space` | Pause / resume | Timer, Countdown, Stopwatch |
| `R` / `r` | Reset | Timer, Countdown, Stopwatch |
| `L` / `l` | Record a lap | Stopwatch (when `enableLapKey` is true) |

## Advanced Examples

### Pause and Resume

```tsx
import { useTimer } from 'ink-timer';
import { Text, Box } from 'ink';

function PauseableTimer() {
  const { formatted, isRunning, start, stop } = useTimer({ autoStart: false });

  return (
    <Box flexDirection="column">
      <Text>{formatted.text}</Text>
      <Text dimColor>
        {isRunning ? 'Running (call stop() to pause)' : 'Paused (call start() to resume)'}
      </Text>
    </Box>
  );
}
```

### Custom Formatting

```tsx
import { useCountdown } from 'ink-timer';
import { Text } from 'ink';

function FriendlyCountdown() {
  const { formatted, isComplete } = useCountdown({
    duration: 60_000,
    format: (ms) => {
      const s = Math.ceil(ms / 1000);
      if (s > 10) return `${s} seconds left`;
      if (s > 0) return `${s}...`;
      return 'Go!';
    },
  });

  return <Text color={isComplete ? 'green' : 'yellow'}>{formatted.text}</Text>;
}
```

### Multiple Timers

```tsx
import { Timer, Countdown } from 'ink-timer';
import { Box, Text } from 'ink';

function Dashboard() {
  return (
    <Box flexDirection="column" gap={1}>
      <Box>
        <Text>Uptime: </Text>
        <Timer format="human" color="green" />
      </Box>
      <Box>
        <Text>Break ends in: </Text>
        <Countdown
          duration={5 * 60_000}
          format="digital"
          color="yellow"
          onComplete={() => console.log('Break over!')}
        />
      </Box>
    </Box>
  );
}
```

### Lap Tracking

```tsx
import { useStopwatch } from 'ink-timer';
import { Text, Box } from 'ink';

function LapTracker() {
  const { formatted, laps, lap, reset } = useStopwatch({
    format: 'digital-ms',
    interval: 100,
  });

  return (
    <Box flexDirection="column">
      <Text bold>{formatted.text}</Text>
      {laps.map((l) => (
        <Text key={l.number}>
          Lap {l.number}: {l.formatted.text} (total: {l.cumulativeMs}ms)
        </Text>
      ))}
    </Box>
  );
}
```

## TypeScript

All types are exported from the package entry point:

```ts
import type {
  FormatFunction,
  FormatPreset,
  FormatOption,
  FormattedTime,
  UseTimerOptions,
  UseTimerResult,
  UseCountdownOptions,
  UseCountdownResult,
  UseStopwatchOptions,
  UseStopwatchResult,
  Lap,
  TimerProps,
  CountdownProps,
  StopwatchProps,
  TimerDisplayProps,
} from 'ink-timer';
```

## Contributing

Contributions welcome! Please open an issue first to discuss what you'd like to change.

## Changelog

See [GitHub Releases](https://github.com/costajohnt/ink-timer/releases).

## License

MIT
