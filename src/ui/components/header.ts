import { createElement } from '../../utils/helpers';
import { gameActions, gameEvents } from '../../state/game-controller';
import { getSettings, getState } from '../../state/game-state';
import { createTimer } from './timer';
import { showLeaderboard } from './dialogs/leaderboard-dialog';
import { showSettings } from './dialogs/settings-dialog';
import { showHelp } from './dialogs/help-dialog';
import { GAME_EVENTS } from '../../data/game';

export function createHeader(): HTMLElement {
  const lives = createElement('div', {
    className: 'header__lives',
    attributes: { 'aria-label': 'Lives' },
  });

  const score = createElement('div', {
    className: 'header__score',
    attributes: { 'aria-label': 'Score' },
  });

  const difficultyBadge = createElement('div', {
    className: 'header__difficulty',
    attributes: { 'aria-label': 'Difficulty' },
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
    const total = getSettings().lives;

    if (lives.children.length !== total) {
      lives.replaceChildren(
        ...Array.from({ length: total }, () =>
          createElement('span', { className: 'header__heart', textContent: '♥' }),
        ),
      );
    }

    for (const [index, heart] of [...lives.children].entries()) {
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

  const renderDifficulty = (): void => {
    const { difficulty } = getState();
    const label = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

    difficultyBadge.textContent = label;
    difficultyBadge.setAttribute('aria-label', `Difficulty: ${label}`);
  };

  gameEvents.addEventListener(GAME_EVENTS.lives, renderLives);
  gameEvents.addEventListener(GAME_EVENTS.score, renderScore);
  gameEvents.addEventListener(GAME_EVENTS.status, renderIdleState);
  gameEvents.addEventListener(GAME_EVENTS.difficulty, renderDifficulty);
  gameEvents.addEventListener(GAME_EVENTS.difficulty, renderLives);
  renderDifficulty();
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
        children: [lives, score, difficultyBadge],
      }),
    ],
  });
}
