import { createElement } from '../../utils/helpers';
import { GAME_EVENTS, gameActions, gameEvents, getState } from '../../state/game-state';
import { LEVEL_1_LIVES } from '../../data/game';
import { createTimer } from './timer';
import { showLeaderboard } from './dialogs/leaderboard-dialog';
import { showSettings } from './dialogs/settings-dialog';
import { showHelp } from './dialogs/help-dialog';

export function createHeader(): HTMLElement {
  const hearts = Array.from({ length: LEVEL_1_LIVES }, () =>
    createElement('span', { className: 'header__heart', textContent: '♥' }),
  );

  const lives = createElement('div', {
    className: 'header__lives',
    attributes: { 'aria-label': 'Lives' },
    children: hearts,
  });

  const score = createElement('div', {
    className: 'header__score',
    attributes: { 'aria-label': 'Score' },
  });

  const leaderboardButton = createElement('button', {
    className: 'header__button',
    textContent: 'Leaderboard',
    attributes: { type: 'button' },
    events: { click: showLeaderboard },
  });

  const settingsButton = createElement('button', {
    className: 'header__button',
    textContent: 'Settings',
    attributes: { type: 'button' },
    events: { click: showSettings },
  });

  const helpButton = createElement('button', {
    className: 'header__button',
    textContent: 'Help',
    attributes: { type: 'button' },
    events: {
      click: () => {
        gameActions.pauseGame();
        showHelp();
      },
    },
  });

  const renderLives = (): void => {
    const { lives: livesLeft } = getState();
    for (const [index, heart] of hearts.entries()) {
      heart.classList.toggle('header__heart--lost', index >= livesLeft);
    }
    lives.setAttribute('aria-label', `Lives: ${livesLeft}`);
  };

  const renderIdleState = (): void => {
    const { status } = getState();
    const isIdle = status === 'menu' || status === 'game-over';

    leaderboardButton.hidden = !isIdle;
    settingsButton.hidden = !isIdle;
    lives.hidden = isIdle;
  };

  const renderScore = (): void => {
    const { score: currentScore } = getState();
    score.textContent = `Score: ${currentScore}`;
    score.setAttribute('aria-label', `Score: ${currentScore}`);
  };

  gameEvents.addEventListener(GAME_EVENTS.lives, renderLives);
  gameEvents.addEventListener(GAME_EVENTS.score, renderScore);
  gameEvents.addEventListener(GAME_EVENTS.status, renderIdleState);
  renderLives();
  renderScore();
  renderIdleState();

  return createElement('header', {
    className: 'header',
    children: [
      createElement('div', {
        className: 'header__side',
        children: [helpButton, settingsButton, leaderboardButton],
      }),
      createTimer(),
      createElement('div', {
        className: 'header__side header__side--end',
        children: [lives, score],
      }),
    ],
  });
}
