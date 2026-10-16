import { createElement } from '../../utils/helpers';
import { GAME_EVENTS, gameEvents, getState } from '../../state/game-state';
import { LEVEL_1_LIVES } from '../../data/game';
import { createTimer } from './timer';
import { showLeaderboard } from './dialogs/leaderboard-dialog';

export function createHeader(): HTMLElement {
  const hearts = Array.from({ length: LEVEL_1_LIVES }, () =>
    createElement('span', { className: 'header__heart', textContent: '♥' }),
  );

  const lives = createElement('div', {
    className: 'header__lives',
    attributes: { 'aria-label': 'Lives' },
    children: hearts,
  });

  const leaderboardButton = createElement('button', {
    className: 'header__leaderboard-button',
    textContent: 'Leaderboard',
    attributes: { type: 'button' },
    events: { click: showLeaderboard },
  });

  const renderLives = (): void => {
    const { lives: livesLeft } = getState();
    for (const [index, heart] of hearts.entries()) {
      heart.classList.toggle('header__heart--lost', index >= livesLeft);
    }
    lives.setAttribute('aria-label', `Lives: ${livesLeft}`);
  };

  const renderLeaderboardButton = (): void => {
    const { status } = getState();
    leaderboardButton.hidden = status !== 'menu' && status !== 'game-over';
  };

  gameEvents.addEventListener(GAME_EVENTS.lives, renderLives);
  gameEvents.addEventListener(GAME_EVENTS.status, renderLeaderboardButton);
  renderLives();
  renderLeaderboardButton();

  return createElement('header', {
    className: 'header',
    children: [
      createElement('div', { className: 'header__side', children: [leaderboardButton] }),
      createTimer(),
      createElement('div', {
        className: 'header__side header__side--end',
        children: [lives],
      }),
    ],
  });
}
