import { createElement } from '../../utils/helpers';
import { GAME_EVENTS, gameEvents, getState } from '../../state/game-state';
import { LEVEL_1_LIVES } from '../../data/game';
import { createTimer } from './timer';

export function createHeader(): HTMLElement {
  const hearts = Array.from({ length: LEVEL_1_LIVES }, () =>
    createElement('span', { className: 'header__heart', textContent: '♥' }),
  );

  const lives = createElement('div', {
    className: 'header__lives',
    attributes: { 'aria-label': 'Lives' },
    children: hearts,
  });

  const renderLives = (): void => {
    const { lives: livesLeft } = getState();
    for (const [index, heart] of hearts.entries()) {
      heart.classList.toggle('header__heart--lost', index >= livesLeft);
    }
    lives.setAttribute('aria-label', `Lives: ${livesLeft}`);
  };

  gameEvents.addEventListener(GAME_EVENTS.lives, renderLives);
  renderLives();

  return createElement('header', {
    className: 'header',
    children: [
      createElement('div', { className: 'header__side' }),
      createTimer(),
      createElement('div', {
        className: 'header__side header__side--end',
        children: [lives],
      }),
    ],
  });
}
