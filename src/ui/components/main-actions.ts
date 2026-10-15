import { createElement } from '../../utils/helpers';
import { GAME_EVENTS, gameActions, gameEvents, getState } from '../../state/game-state';
import { calculateCauldron, type IBarData } from '../../logic/calculate-cauldron';

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

  return { element, update };
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

  const render = (): void => {
    const { activeRecipe, cauldronIngredients } = getState();

    const isButtonIdle = isIdle();

    brewButton.textContent = isButtonIdle ? 'Start Game' : 'Brew';
    brewButton.disabled = !isButtonIdle && cauldronIngredients.length === 0;

    if (!activeRecipe) return;
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
    children: [barSection, brewButton],
  });
}
