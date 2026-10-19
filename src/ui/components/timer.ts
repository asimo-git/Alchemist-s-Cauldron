import { capitalize, createElement } from '../../utils/helpers';
import { getSettings, getState } from '../../state/game-state';
import { gameActions, gameEvents } from '../../state/game-controller';
import { calculateTimePercent, formatTime, isTimeLow } from '../../logic/timer';
import { GAME_EVENTS } from '../../data/game';

export function createTimer(): HTMLElement {
  const text = createElement('span', { className: 'timer__text', textContent: '00:00' });
  const fill = createElement('div', { className: 'timer__fill' });
  const bar = createElement('div', { className: 'timer__bar', children: [fill] });
  const pauseButton = createElement('button', {
    className: 'timer__pause',
    textContent: 'Pause',
    attributes: { type: 'button' },
    events: { click: gameActions.pauseGame },
  });

  const difficultyBadge = createElement('span', { className: 'timer__difficulty' });

  const element = createElement('div', {
    className: 'timer',
    attributes: { role: 'timer' },
    children: [
      createElement('div', {
        className: 'timer__top',
        children: [difficultyBadge, text, pauseButton],
      }),
      bar,
    ],
  });

  const renderDifficulty = (): void => {
    const { difficulty } = getState();
    const label = capitalize(difficulty);

    difficultyBadge.textContent = label;
    difficultyBadge.dataset.difficulty = difficulty;
    difficultyBadge.setAttribute('aria-label', `Difficulty: ${label}`);
  };

  const render = (): void => {
    const { timeLeft, status } = getState();

    text.textContent = formatTime(timeLeft);
    fill.style.width = `${calculateTimePercent(timeLeft, getSettings().startTime)}%`;
    element.classList.toggle('timer--low', status !== 'menu' && isTimeLow(timeLeft));
    element.classList.toggle('timer--over', status === 'game-over');
    element.classList.toggle('timer--idle', status !== 'playing');
  };

  gameEvents.addEventListener(GAME_EVENTS.timeLeft, render);
  gameEvents.addEventListener(GAME_EVENTS.status, render);
  gameEvents.addEventListener(GAME_EVENTS.difficulty, renderDifficulty);
  render();
  renderDifficulty();

  return element;
}
