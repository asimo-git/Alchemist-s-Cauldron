import { createElement } from '../../utils/helpers';
import { gameActions, gameEvents } from '../../state/game-controller';
import { getState } from '../../state/game-state';
import { calculateCauldron, type IBarData } from '../../logic/calculate-cauldron';
import { loadGame } from '../../logic/game-save';
import { GAME_EVENTS } from '../../data/game';

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

  // empty bar without a recipe: no target zone, marker at zero
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

  const render = (): void => {
    const { activeRecipe, cauldronIngredients } = getState();

    const isButtonIdle = isIdle();
    continueButton.hidden = !isButtonIdle || loadGame() === undefined;
    brewButton.textContent = isButtonIdle ? 'Start Game' : 'Brew';
    brewButton.disabled = !isButtonIdle && cauldronIngredients.length === 0;

    if (!activeRecipe) {
      for (const bar of Object.values(bars)) bar.reset();
      return;
    }

    for (const data of calculateCauldron(cauldronIngredients, activeRecipe)) {
      bars[data.key].update(data);
    }
  };

  gameEvents.addEventListener(GAME_EVENTS.cauldronIngredients, render);
  gameEvents.addEventListener(GAME_EVENTS.activeRecipe, render);
  gameEvents.addEventListener(GAME_EVENTS.status, render);
  render();

  return createElement('div', {
    className: 'main-actions',
    children: [barSection, continueButton, brewButton],
  });
}
