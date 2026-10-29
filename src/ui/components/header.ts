import { createElement } from '../../utils/helpers';
import { gameActions, gameEvents } from '../../state/game-controller';
import { getSettings, getState } from '../../state/game-state';
import { createTimer } from './timer';
import { showLeaderboard } from './dialogs/leaderboard-dialog';
import { showSettings } from './dialogs/settings-dialog';
import { showHelp } from './dialogs/help-dialog';
import { showMenu } from './dialogs/menu-dialog';
import { GAME_EVENTS } from '../../data/game';
import { translate } from '../../i18n';

export function createHeader(): HTMLElement {
  const lives = createElement('div', {
    className: 'header__lives',
    attributes: { 'aria-label': translate('header.lives') },
  });

  const score = createElement('div', {
    className: 'header__score',
    attributes: { 'aria-label': translate('header.score') },
  });

  const leaderboardButton = createElement('button', {
    className: 'header__button header__button--leaderboard',
    attributes: {
      type: 'button',
      'aria-label': translate('menu.leaderboard'),
      title: translate('menu.leaderboard'),
    },
    events: { click: showLeaderboard },
  });

  const settingsButton = createElement('button', {
    className: 'header__button header__button--settings',
    attributes: {
      type: 'button',
      'aria-label': translate('settings.title'),
      title: translate('settings.title'),
    },
    events: { click: showSettings },
  });

  const helpButton = createElement('button', {
    className: 'header__button header__button--help',
    attributes: {
      type: 'button',
      'aria-label': translate('header.help'),
      title: translate('header.help'),
    },
    events: {
      click: () => {
        gameActions.pauseGame();
        showHelp();
      },
    },
  });

  const menuButton = createElement('button', {
    className: 'header__button header__menu',
    attributes: {
      type: 'button',
      'aria-haspopup': 'dialog',
      'aria-label': translate('header.menu'),
      title: translate('header.menu'),
    },
    events: { click: showMenu },
  });

  const controls = createElement('div', {
    className: 'header__side header__controls',
    children: [menuButton, helpButton, settingsButton, leaderboardButton],
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
    lives.setAttribute('aria-label', translate('header.livesCount', { lives: livesLeft }));
  };

  const renderIdleState = (): void => {
    const { status } = getState();
    const isIdle = status === 'menu' || status === 'game-over';

    leaderboardButton.hidden = !isIdle;
    settingsButton.hidden = !isIdle;
    menuButton.hidden = !isIdle;
    controls.classList.toggle('header__side--idle', isIdle);
    lives.hidden = isIdle;
  };

  const renderScore = (): void => {
    const { score: currentScore } = getState();
    const text = translate('header.score', { score: currentScore });
    score.textContent = text;
    score.setAttribute('aria-label', text);
  };

  gameEvents.addEventListener(GAME_EVENTS.lives, renderLives);
  gameEvents.addEventListener(GAME_EVENTS.score, renderScore);
  gameEvents.addEventListener(GAME_EVENTS.status, renderIdleState);
  gameEvents.addEventListener(GAME_EVENTS.difficulty, renderLives);
  renderLives();
  renderScore();
  renderIdleState();

  return createElement('header', {
    className: 'header',
    children: [
      controls,
      createTimer(),

      createElement('div', {
        className: 'header__side header__side--end',
        children: [lives, score],
      }),
    ],
  });
}
