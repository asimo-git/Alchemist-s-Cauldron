import type { IIngredient } from '../../utils/types';
import { INGREDIENTS } from '../../data/ingredients';
import { createElement } from '../../utils/helpers';
import { GAME_EVENTS, gameActions, gameEvents, getState } from '../../state/game-state';
import { canAddToCauldron } from '../../logic/calculate-cauldron';

export function createShelfSection(): HTMLElement {
  gameActions.startNewGame();
  const controller = new AbortController();
  const { shelfStock } = getState();

  const ingredients = INGREDIENTS.filter((item) => Object.hasOwn(shelfStock, item.id));
  // destroy: () => controller.abort() при обновлении карточек

  return createElement('section', {
    className: 'shelf_container',
    attributes: { 'aria-label': 'Ingredient shelf' },
    children: ingredients.map((item) =>
      createIngredientCard(item, shelfStock[item.id], controller.signal),
    ),
  });
}

function createIngredientCard(
  ingredient: IIngredient,
  stock: number | undefined,
  signal: AbortSignal,
): HTMLButtonElement {
  const icon = createElement('img', {
    className: 'shelf_card_icon',
    attributes: { src: 'potion.png', alt: '', 'aria-hidden': 'true', draggable: 'false' },
  });

  const stockBadge = createElement('span', {
    className: 'shelf_card_stock',
    textContent: String(stock ?? 0),
    attributes: { 'aria-hidden': 'true' },
  });

  const stats = createElement('ul', {
    className: 'shelf_card_stats',
    children: [
      createStat('Temp', ingredient.temperature, 'temperature'),
      createStat('Density', ingredient.density, 'density'),
      createStat('Magic', ingredient.magicPower, 'magic'),
    ],
  });

  const element = createElement('button', {
    className: 'shelf_card',
    attributes: { type: 'button' },
    events: { click: () => gameActions.addToCauldron(ingredient.id) },
    children: [
      icon,
      stockBadge,
      createElement('div', {
        className: 'shelf_card_text',
        children: [
          createElement('span', { className: 'shelf_card_name', textContent: ingredient.name }),
          stats,
        ],
      }),
    ],
  });

  const render = () => {
    const { shelfStock, cauldronIngredients } = getState();
    const stock = shelfStock[ingredient.id] ?? 0;

    element.disabled = !canAddToCauldron(cauldronIngredients);
    element.classList.toggle('shelf_card_empty', stock === 0);
    element.setAttribute(
      'aria-label',
      stock === 0
        ? `${ingredient.name}, out of stock`
        : `Add ${ingredient.name}, ${stock} in stock`,
    );
    stockBadge.textContent = String(stock);
    icon.src = stock === 0 ? 'potion-empty.png' : 'potion.png';
  };

  render();
  gameEvents.addEventListener(GAME_EVENTS.shelfStock, render, { signal });

  return element;
}

function createStat(label: string, value: number, modifier: string): HTMLElement {
  return createElement('li', {
    className: `shelf_stat shelf_stat_${modifier}`,
    children: [
      createElement('span', { className: 'shelf_stat_label', textContent: label }),
      createElement('span', { className: 'shelf_stat_value', textContent: String(value) }),
    ],
  });
}
