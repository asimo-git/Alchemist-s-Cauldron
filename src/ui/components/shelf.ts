import type { IIngredient, IIngredientTooltip } from '../../utils/types';
import { INGREDIENTS } from '../../data/ingredients';
import { translate } from '../../i18n';
import { createElement } from '../../utils/helpers';
import { getState } from '../../state/game-state';
import { gameActions, gameEvents } from '../../state/game-controller';
import { canAddToCauldron } from '../../logic/calculate-cauldron';
import { GAME_EVENTS, GAME_SIGNALS, INGREDIENT_DRAG_ID } from '../../data/game';
import { canDrag } from '../../logic/stock';
import { createIngredientTooltip } from './ingredient-tooltip';

const hoverQuery = globalThis.matchMedia('(hover: hover) and (pointer: fine)');

const isTooltipMode = (): boolean => getState().difficulty === 'hard' && hoverQuery.matches;

export function createShelfSection(): HTMLElement {
  const controller = new AbortController();
  const { signal } = controller;

  const grid = createElement('div', {
    className: 'shelf_grid',
    attributes: { 'data-empty-text': translate('shelf.empty') },
  });

  const shelf = createElement('section', {
    className: 'shelf_container',
    attributes: { 'aria-label': translate('shelf.ariaLabel') },
    children: [
      createElement('h3', { className: 'shelf_title', textContent: translate('shelf.title') }),
      grid,
    ],
  });

  const tooltip = createIngredientTooltip(signal);
  shelf.append(tooltip.element);

  shelf.addEventListener('scroll', () => tooltip.hide(), { capture: true, signal });

  let cardsController: AbortController | undefined;

  function clearCards(): void {
    cardsController?.abort();
    cardsController = undefined;
    tooltip.hide();
    grid.replaceChildren();
  }

  function syncLocked(): void {
    const isLocked = !canAddToCauldron(getState().cauldronIngredients);
    if (isLocked) tooltip.hide();
    shelf.classList.toggle('shelf_container_isLocked', isLocked);
    shelf.inert = isLocked;
  }

  function syncTooltipMode(): void {
    const isEnabled = isTooltipMode();
    shelf.classList.toggle('shelf_container_tooltips', isEnabled);
    if (!isEnabled) tooltip.hide();
  }

  function buildCards(): void {
    clearCards();
    cardsController = new AbortController();
    const cardsSignal = cardsController.signal;

    const { shelfStock } = getState();
    const ingredients = INGREDIENTS.filter((item) => Object.hasOwn(shelfStock, item.id));

    grid.append(...ingredients.map((item) => createIngredientCard(item, cardsSignal, tooltip)));
    syncLocked();
  }

  gameEvents.addEventListener(GAME_SIGNALS.gameBegun, buildCards, { signal });
  gameEvents.addEventListener(GAME_EVENTS.cauldronIngredients, syncLocked, { signal });
  gameEvents.addEventListener(
    GAME_EVENTS.status,
    () => {
      syncLocked();
      const { status } = getState();
      if (status === 'game-over' || status === 'menu') clearCards();
    },
    { signal },
  );
  gameEvents.addEventListener(GAME_EVENTS.difficulty, syncTooltipMode, { signal });
  hoverQuery.addEventListener('change', syncTooltipMode, { signal });

  syncTooltipMode();

  if (getState().activeRecipe) buildCards();

  return shelf;
}

function createIngredientCard(
  ingredient: IIngredient,
  signal: AbortSignal,
  tooltip: IIngredientTooltip,
): HTMLButtonElement {
  const name = translate(`ingredient.${ingredient.id}`);

  const icon = createElement('img', {
    className: 'shelf_card_icon',
    attributes: { src: ingredient.icon, alt: '', 'aria-hidden': 'true', draggable: 'false' },
  });

  const stockBadge = createElement('span', {
    className: 'shelf_card_stock',
    attributes: { 'aria-hidden': 'true' },
  });

  const stats = createElement('ul', {
    className: 'shelf_card_stats',
    children: [
      createStat('shelf.stat.temperature', ingredient.temperature, 'temperature'),
      createStat('shelf.stat.density', ingredient.density, 'density'),
      createStat('shelf.stat.magicPower', ingredient.magicPower, 'magic'),
    ],
  });

  const showTooltip = (): void => {
    if (element.disabled || !isTooltipMode() || getState().status !== 'playing') return;
    tooltip.show(element, ingredient);
  };
  const hideTooltip = (): void => tooltip.hide(element);

  const element = createElement('button', {
    className: 'shelf_card',
    attributes: { type: 'button', draggable: 'true' },
    events: {
      click: () => {
        gameActions.addToCauldron(ingredient.id);
      },
      dragstart: (event) => {
        hideTooltip();
        if (!canDrag(ingredient) || !(event instanceof DragEvent) || !event.dataTransfer) {
          event.preventDefault();
          return;
        }
        event.dataTransfer.setData(INGREDIENT_DRAG_ID, ingredient.id);
        event.dataTransfer.effectAllowed = 'copy';
        element.classList.add('shelf_card_dragging');
      },
      dragend: () => {
        element.classList.remove('shelf_card_dragging');
      },
      pointerenter: (event) => {
        if (event instanceof PointerEvent && event.pointerType === 'mouse') showTooltip();
      },
      pointerleave: hideTooltip,
      focus: () => {
        if (element.matches(':focus-visible')) showTooltip();
      },
      blur: hideTooltip,
    },

    children: [
      icon,
      stockBadge,
      createElement('div', {
        className: 'shelf_card_text',
        children: [
          createElement('span', { className: 'shelf_card_name', textContent: name }),
          stats,
        ],
      }),
    ],
  });

  const render = (): void => {
    const stock = getState().shelfStock[ingredient.id] ?? 0;
    const isEmpty = stock === 0;

    element.disabled = isEmpty;
    element.draggable = !isEmpty;
    element.classList.toggle('shelf_card_empty', isEmpty);
    element.setAttribute(
      'aria-label',
      translate(isEmpty ? 'shelf.card.empty' : 'shelf.card.add', { name, stock }),
    );
    stockBadge.textContent = String(stock);
    icon.src = isEmpty ? 'potion-empty.png' : ingredient.icon;
    if (isEmpty) hideTooltip();
  };

  render();

  gameEvents.addEventListener(GAME_EVENTS.shelfStock, render, { signal });

  return element;
}

function createStat(labelKey: string, value: number, modifier: string): HTMLElement {
  return createElement('li', {
    className: `shelf_stat shelf_stat_${modifier}`,
    children: [
      createElement('span', { className: 'shelf_stat_label', textContent: translate(labelKey) }),
      createElement('span', { className: 'shelf_stat_value', textContent: String(value) }),
    ],
  });
}
