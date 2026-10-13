import type { IIngredient } from '../../utils/types';
import { INGREDIENTS } from '../../data/ingredients';
import { createElement, randomInt } from '../../utils/helpers';
import { MAX_STOCK, MIN_STOCK, SHELF_SIZE } from '../../data/game';

export function createShelfSection(): HTMLElement {
  const cards = INGREDIENTS.slice(0, SHELF_SIZE).map((ingredient) =>
    createIngredientCard(ingredient, randomInt(MIN_STOCK, MAX_STOCK)),
  );

  return createElement('section', {
    className: 'shelf_container',
    attributes: { 'aria-label': 'Ingredient shelf' },
    children: cards,
  });
}

function createIngredientCard(ingredient: IIngredient, stock: number): HTMLButtonElement {
  const icon = createElement('img', {
    className: 'shelf_card_icon',
    attributes: {
      src: 'potion.png',
      alt: '',
      'aria-hidden': 'true',
      draggable: 'false',
    },
  });

  const stockBadge = createElement('span', {
    className: 'shelf_card_stock',
    textContent: String(stock),
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

  return createElement('button', {
    className: 'shelf_card',
    attributes: {
      type: 'button',
      'aria-label': `Add ${ingredient.name}, ${stock} in stock`,
    },
    children: [
      // createElement('span', { className: 'shelf_card_frame', children: [icon] }),
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
