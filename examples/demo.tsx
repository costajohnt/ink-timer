/**
 * Example usage of ink-timer components.
 *
 * Before running, build and link the package:
 *   cd /path/to/ink-timer && npm run build && npm link
 *   cd /path/to/this-example && npm link ink-timer
 *
 * Then run with:
 *   npx tsx examples/demo.tsx
 */
import React from 'react';
import { render, Box, Text } from 'ink';
import { Timer, Countdown, Stopwatch } from 'ink-timer';

function App() {
  return (
    <Box flexDirection="column" gap={1}>
      <Box flexDirection="column">
        <Text bold underline>Timer (auto-start, keyboard enabled)</Text>
        <Timer
          prefix="Elapsed: "
          format="human"
          enableKeyboard
          color="green"
        />
      </Box>

      <Box flexDirection="column">
        <Text bold underline>Countdown (30 seconds)</Text>
        <Countdown
          duration={30_000}
          prefix="Remaining: "
          color="yellow"
          onComplete={() => {
            console.log('\nCountdown complete!');
          }}
        />
      </Box>

      <Box flexDirection="column">
        <Text bold underline>Stopwatch (keyboard: Space=pause, R=reset, L=lap)</Text>
        <Stopwatch
          enableKeyboard
          color="cyan"
          showLaps
          maxLapsDisplay={5}
        />
      </Box>

      <Box marginTop={1}>
        <Text dimColor>
          Controls: Space=pause/resume, R=reset, L=lap (stopwatch)
        </Text>
      </Box>
    </Box>
  );
}

render(<App />);
