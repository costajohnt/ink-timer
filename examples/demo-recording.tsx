/**
 * Self-contained demo for VHS recording.
 *
 * Renders Timer, Countdown, and Stopwatch stacked vertically
 * and programmatically triggers actions (pause, resume, lap)
 * to show off features without keyboard input.
 *
 * Run with: npx tsx examples/demo-recording.tsx
 */
import React, { useEffect, useState } from 'react';
import { render, Box, Text } from 'ink';
import { useTimer, useCountdown, useStopwatch } from 'ink-timer';

function Demo() {
  const [timerStatus, setTimerStatus] = useState('');
  const [countdownStatus, setCountdownStatus] = useState('');
  const [stopwatchStatus, setStopwatchStatus] = useState('');

  const timer = useTimer({ autoStart: true, interval: 100, format: 'digital-ms' });
  const countdown = useCountdown({
    duration: 10_000,
    autoStart: true,
    interval: 100,
    format: 'digital-ms',
    onComplete: () => setCountdownStatus(' Done!'),
  });
  const stopwatch = useStopwatch({
    autoStart: true,
    interval: 100,
    format: 'digital-ms',
  });

  useEffect(() => {
    // t=2s: record first lap
    const lap1 = setTimeout(() => {
      stopwatch.lap();
      setStopwatchStatus(' Lap!');
    }, 2000);

    // t=2.8s: clear lap status
    const clearLap1 = setTimeout(() => setStopwatchStatus(''), 2800);

    // t=3s: pause the timer
    const pause = setTimeout(() => {
      timer.stop();
      setTimerStatus(' Paused');
    }, 3000);

    // t=4s: record second lap
    const lap2 = setTimeout(() => {
      stopwatch.lap();
      setStopwatchStatus(' Lap!');
    }, 4000);

    // t=4.8s: clear lap status
    const clearLap2 = setTimeout(() => setStopwatchStatus(''), 4800);

    // t=5s: resume the timer
    const resume = setTimeout(() => {
      timer.start();
      setTimerStatus(' Resumed');
    }, 5000);

    // t=5.8s: clear timer status
    const clearResume = setTimeout(() => setTimerStatus(''), 5800);

    // t=6s: record third lap
    const lap3 = setTimeout(() => {
      stopwatch.lap();
      setStopwatchStatus(' Lap!');
    }, 6000);

    // t=6.8s: clear lap status
    const clearLap3 = setTimeout(() => setStopwatchStatus(''), 6800);

    return () => {
      clearTimeout(lap1);
      clearTimeout(clearLap1);
      clearTimeout(pause);
      clearTimeout(lap2);
      clearTimeout(clearLap2);
      clearTimeout(resume);
      clearTimeout(clearResume);
      clearTimeout(lap3);
      clearTimeout(clearLap3);
    };
  }, []);

  return (
    <Box flexDirection="column" paddingX={1} paddingY={1}>
      <Box marginBottom={1}>
        <Text bold color="magenta">
          {'  ink-timer demo  '}
        </Text>
      </Box>

      {/* Timer */}
      <Box flexDirection="column" marginBottom={1}>
        <Box>
          <Text bold color="green">{'> Timer    '}</Text>
          <Text color="green" bold>{timer.formatted.text}</Text>
          <Text color="yellow">{timerStatus}</Text>
        </Box>
        <Text dimColor>  Counts up from zero</Text>
      </Box>

      {/* Countdown */}
      <Box flexDirection="column" marginBottom={1}>
        <Box>
          <Text bold color="yellow">{'> Countdown'}</Text>
          <Text color={countdown.isComplete ? 'green' : 'yellow'} bold>
            {' '}{countdown.formatted.text}
          </Text>
          <Text color="green">{countdownStatus}</Text>
        </Box>
        <Text dimColor>  Counts down from 10s</Text>
      </Box>

      {/* Stopwatch */}
      <Box flexDirection="column">
        <Box>
          <Text bold color="cyan">{'> Stopwatch'}</Text>
          <Text color="cyan" bold>{' '}{stopwatch.formatted.text}</Text>
          <Text color="magenta">{stopwatchStatus}</Text>
        </Box>
        <Text dimColor>  Counts up with lap recording</Text>
        {stopwatch.laps.length > 0 && (
          <Box flexDirection="column" marginLeft={2} marginTop={0}>
            {stopwatch.laps.map((l) => (
              <Box key={l.number} gap={1}>
                <Text dimColor>Lap {l.number}</Text>
                <Text>{l.formatted.text}</Text>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Box marginTop={1}>
        <Text dimColor>
          Keyboard: Space=pause/resume  R=reset  L=lap
        </Text>
      </Box>
    </Box>
  );
}

render(<Demo />);
