import type { IIngredient } from '../../utils/types';
import { INGREDIENTS } from '../../data/ingredients';
import { createElement } from '../../utils/helpers';
import {
  GAME_EVENTS,
  GAME_SIGNALS,
  gameActions,
  gameEvents,
  getState,
} from '../../state/game-state';
import { canAddToCauldron } from '../../logic/calculate-cauldron';

export function createShelfSection(): HTMLElement {
  const controller = new AbortController();
  const { signal } = controller;

  const shelf = createElement('section', {
    className: 'shelf_container',
    attributes: { 'aria-label': 'Ingredient shelf' },
  });

  const cards = new Map<string, HTMLButtonElement>();

  function buildCards(): void {
    shelf.replaceChildren();
    cards.clear();

    const { shelfStock } = getState();
    const ingredients = INGREDIENTS.filter((item) => Object.hasOwn(shelfStock, item.id));

    for (const item of ingredients) {
      const card = createIngredientCard(item, signal);
      cards.set(item.id, card);
      shelf.append(card);
    }
  }

  function setLocked(isLocked: boolean): void {
    shelf.classList.toggle('shelf_container_isLocked', isLocked);
    shelf.inert = isLocked;
    shelf.setAttribute('aria-disabled', String(isLocked));
  }

  function syncLocked(): void {
    const { cauldronIngredients } = getState();
    setLocked(!canAddToCauldron(cauldronIngredients));
  }

  gameEvents.addEventListener(
    GAME_SIGNALS.gameBegun,
    () => {
      buildCards();
      syncLocked();
    },
    { signal },
  );

  gameEvents.addEventListener(GAME_EVENTS.cauldronIngredients, syncLocked, { signal });
  gameEvents.addEventListener(
    GAME_EVENTS.status,
    () => {
      syncLocked();
      if (getState().status === 'game-over' || getState().status === 'menu')
        shelf.replaceChildren();
    },
    { signal },
  );

  if (getState().activeRecipe) {
    buildCards();
    syncLocked();
  }

  return shelf;
}

function createIngredientCard(ingredient: IIngredient, signal: AbortSignal): HTMLButtonElement {
  const icon = createElement('img', {
    className: 'shelf_card_icon',
    attributes: { src: 'potion.png', alt: '', 'aria-hidden': 'true', draggable: 'false' },
  });

  const stockBadge = createElement('span', {
    className: 'shelf_card_stock',
    textContent: '0',
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
    events: {
      click: () => {
        gameActions.addToCauldron(ingredient.id);
      },
    },
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

  const render = (): void => {
    const { shelfStock, cauldronIngredients } = getState();
    const stock = shelfStock[ingredient.id] ?? 0;

    element.disabled = !canAddToCauldron(cauldronIngredients) || stock === 0;
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
  gameEvents.addEventListener(GAME_EVENTS.cauldronIngredients, render, { signal });

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
