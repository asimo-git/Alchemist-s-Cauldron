import { BREW_TIME_BONUS, LEVEL_1_TIME, LOW_TIME_THRESHOLD } from '../data/game';

export const calculateTimeLeft = (endTime: number, now: number): number =>
  Math.max(0, Math.ceil((endTime - now) / 1000));

export function formatTime(timeLeft: number): string {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export const calculateTimePercent = (timeLeft: number, totalTime: number): number =>
  Math.min(100, Math.max(0, (timeLeft / totalTime) * 100));

export const isTimeLow = (timeLeft: number): boolean => timeLeft < LOW_TIME_THRESHOLD;

export function createCountdown(
  onTick: (timeLeft: number) => void,
  onEnd?: () => void,
): {
  start: (seconds: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  addTime: () => void;
} {
  let endTime = 0;
  let remainingMs = 0;
  let intervalId: number | undefined;
  let isPaused = false;
  let hasEnded = false;

  function update(): void {
    const timeLeft = calculateTimeLeft(endTime, Date.now());

    if (timeLeft === 0) {
      stop();
      if (!hasEnded) {
        hasEnded = true;
        onEnd?.();
      }
    }

    onTick(timeLeft);
  }

  function run(ms: number): void {
    clearInterval(intervalId);
    endTime = Date.now() + ms;
    intervalId = setInterval(update, 250);
  }

  function pause(): void {
    if (isPaused || intervalId === undefined) return;

    remainingMs = Math.max(0, endTime - Date.now());
    clearInterval(intervalId);
    intervalId = undefined;
    isPaused = true;
  }

  function resume(): void {
    if (!isPaused) return;

    isPaused = false;
    run(remainingMs);
  }

  function stop(): void {
    clearInterval(intervalId);
    intervalId = undefined;
    remainingMs = 0;
    isPaused = false;
  }

  function start(seconds: number): void {
    stop();
    hasEnded = false;
    remainingMs = seconds * 1000;
    run(remainingMs);
  }

  function addTime(): void {
    if (!isPaused && intervalId === undefined) return;

    const maxMs = LEVEL_1_TIME * 1000;

    if (isPaused) {
      remainingMs = Math.min(remainingMs + BREW_TIME_BONUS * 1000, maxMs);
      onTick(Math.ceil(remainingMs / 1000));
      return;
    }

    endTime = Math.min(endTime + BREW_TIME_BONUS * 1000, Date.now() + maxMs);
    update();
  }

  return { start, pause, resume, stop, addTime };
}
