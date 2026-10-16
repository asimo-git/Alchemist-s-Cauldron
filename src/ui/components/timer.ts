import { createElement } from '../../utils/helpers';
import { GAME_EVENTS, gameActions, gameEvents, getState } from '../../state/game-state';
import { LEVEL_1_TIME } from '../../data/game';
import { calculateTimePercent, formatTime, isTimeLow } from '../../logic/timer';

export function createTimer(): HTMLElement {
  const text = createElement('span', { className: 'timer__text', textContent: '00:00' });
  const fill = createElement('div', { className: 'timer__fill' });
  const bar = createElement('div', { className: 'timer__bar', children: [fill] });
  const pauseButton = createElement('button', {
    className: 'timer__pause',
    textContent: 'Pause',
    attributes: { type: 'button' },
    events: { click: gameActions.pauseGame },
    // events: { click: openPauseDialog },
  });

  const element = createElement('div', {
    className: 'timer',
    attributes: { role: 'timer' },
    children: [
      createElement('div', { className: 'timer__top', children: [text, pauseButton] }),
      bar,
    ],
  });

  const render = (): void => {
    const { timeLeft, status } = getState();

    text.textContent = formatTime(timeLeft);
    fill.style.width = `${calculateTimePercent(timeLeft, LEVEL_1_TIME)}%`;
    element.classList.toggle('timer--low', status !== 'menu' && isTimeLow(timeLeft));
    element.classList.toggle('timer--over', status === 'game-over');
    element.classList.toggle('timer--idle', status !== 'playing');
  };

  gameEvents.addEventListener(GAME_EVENTS.timeLeft, render);
  gameEvents.addEventListener(GAME_EVENTS.status, render);
  render();

  return element;
}
