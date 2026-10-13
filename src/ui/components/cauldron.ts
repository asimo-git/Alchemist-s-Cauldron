import { CAULDRON_CAPACITY } from '../../data/game';
import { GAME_EVENTS, gameEvents, getState } from '../../state/game-state';
import { createElement } from '../../utils/helpers';

export function createCauldronSection(): HTMLElement {
  const counter = createElement('span', { className: 'cauldron_counter' });

  const indicator = createElement('div', {
    className: 'cauldron_indicator',
    attributes: { role: 'status', 'aria-live': 'polite' },
    textContent: 'Potions in the cauldron:',
    children: [counter],
  });

  const image = createElement('img', {
    className: 'cauldron_img',
    attributes: { src: 'cauldron.gif', alt: 'cauldron', draggable: 'false' },
  });

  const section = createElement('section', {
    className: 'cauldron_container',
    children: [indicator, createElement('div', { className: 'cauldron_frame', children: [image] })],
  });

  function render(): void {
    const { cauldronIngredients } = getState();
    const count = cauldronIngredients.length;

    counter.textContent = `${count} / ${CAULDRON_CAPACITY}`;
    indicator.classList.toggle('cauldron_indicator_full', count >= CAULDRON_CAPACITY);
  }

  gameEvents.addEventListener(GAME_EVENTS.cauldronIngredients, render);

  render();

  return section;
}
