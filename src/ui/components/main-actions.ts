import { createElement } from '../../utils/helpers';
import { gameActions, gameEvents } from '../../state/game-controller';
import { getState } from '../../state/game-state';
import { calculateCauldronBars, type IBarData } from '../../logic/calculate-cauldron';
import { loadGame } from '../../logic/game-save';
import { GAME_EVENTS } from '../../data/game';
import { getReactionsByIds } from '../../logic/reactions';

function createBar(label: string) {
  const correctZone = createElement('div', { className: 'bar__correct-zone' });
  const marker = createElement('div', { className: 'bar__marker' });
  const value = createElement('span', { className: 'bar__value', textContent: '0' });
  const scaleStart = createElement('span', { textContent: '0' });
  const scaleEnd = createElement('span', { textContent: '0' });
  const track = createElement('div', {
    className: 'bar__track-container',
    children: [
      createElement('div', {
        className: 'bar__track',
        children: [correctZone, createElement('div', { className: 'bar__center' }), marker],
      }),
      createElement('div', {
        className: 'bar__scale',
        children: [scaleStart, createElement('span', { textContent: '0' }), scaleEnd],
      }),
    ],
  });

  const element = createElement('div', {
    className: 'bar',
    children: [
      createElement('div', {
        className: 'bar__head',
        children: [createElement('span', { textContent: label }), value],
      }),
      track,
    ],
  });

  const update = (data: IBarData): void => {
    correctZone.style.left = `${data.zoneStart}%`;
    correctZone.style.width = `${data.zoneWidth}%`;
    marker.style.left = `${data.markerPosition}%`;
    value.textContent = String(data.value);
    scaleStart.textContent = String(-data.limit);
    scaleEnd.textContent = String(data.limit);
    element.classList.toggle('bar--in-range', data.inRange);
  };

  const reset = (): void => {
    correctZone.style.left = '';
    correctZone.style.width = '0';
    marker.style.left = '50%';
    value.textContent = '0';
    scaleStart.textContent = '0';
    scaleEnd.textContent = '0';
    element.classList.remove('bar--in-range');
  };

  return { element, update, reset };
}

const isIdle = (): boolean => {
  const { status } = getState();
  return status === 'game-over' || status === 'menu';
};

export function createMainActions(): HTMLElement {
  const bars = {
    temperature: createBar('Temperature'),
    density: createBar('Density'),
    magicPower: createBar('Magic Power'),
  };

  const barSection = createElement('div', {
    className: 'main-actions__bars',
    children: Object.values(bars).map((bar) => bar.element),
  });

  const brewButton = createElement('button', {
    className: 'main-actions__button',
    textContent: 'Start Game',
    attributes: { type: 'button' },
    events: {
      click: () => {
        if (isIdle()) gameActions.startNewGame();
        else gameActions.brew();
      },
    },
  });

  const continueButton = createElement('button', {
    className: 'main-actions__continue',
    textContent: 'Continue Game',
    attributes: { type: 'button' },
    events: { click: () => gameActions.continueGame() },
  });

  const pourOutButton = createElement('button', {
    className: 'main-actions__continue main-actions__pour-out',
    textContent: 'Pour Out',
    attributes: { type: 'button' },
    events: { click: () => gameActions.pourOut() },
  });

  const render = (): void => {
    const { activeRecipe, cauldronIngredients } = getState();

    const isButtonIdle = isIdle();
    continueButton.hidden = !isButtonIdle || loadGame() === undefined;
    brewButton.textContent = isButtonIdle ? 'Start Game' : 'Brew';
    brewButton.disabled = !isButtonIdle && cauldronIngredients.length === 0;
    pourOutButton.hidden = isButtonIdle;
    pourOutButton.disabled = cauldronIngredients.length === 0;

    if (!activeRecipe) {
      for (const bar of Object.values(bars)) bar.reset();
      return;
    }

    const reactions = getReactionsByIds(getState().activeReactionIds);
    for (const data of calculateCauldronBars(cauldronIngredients, activeRecipe, reactions)) {
      bars[data.key].update(data);
    }
  };

  gameEvents.addEventListener(GAME_EVENTS.cauldronIngredients, render);
  gameEvents.addEventListener(GAME_EVENTS.activeRecipe, render);
  gameEvents.addEventListener(GAME_EVENTS.status, render);
  render();

  return createElement('div', {
    className: 'main-actions',
    children: [barSection, continueButton, pourOutButton, brewButton],
  });
}
