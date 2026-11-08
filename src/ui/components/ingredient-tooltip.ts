import type { IIngredient, IIngredientTooltip } from '../../utils/types';
import { createElement } from '../../utils/helpers';
import { getState } from '../../state/game-state';
import { gameEvents } from '../../state/game-controller';
import { GAME_EVENTS, STATS } from '../../data/game';
import { translate } from '../../i18n';

const GAP = 10;
const EDGE = 8;

export function formatSigned(value: number): string {
  if (value > 0) return `+${value}`;
  if (value < 0) return `\u{2212}${Math.abs(value)}`;
  return '0';
}

export function createIngredientTooltip(signal: AbortSignal): IIngredientTooltip {
  const title = createElement('div', { className: 'ingredient_tooltip_title' });

  const rows = STATS.map(({ key }) => {
    const value = createElement('span', { className: 'ingredient_tooltip_value' });
    const row = createElement('div', {
      className: 'ingredient_tooltip_row',
      children: [
        createElement('span', {
          className: 'ingredient_tooltip_label',
          textContent: translate(`stat.${key}`),
        }),
        value,
      ],
    });
    return { key, value, row };
  });

  const root = createElement('div', {
    className: 'ingredient_tooltip',
    attributes: { id: 'ingredient-tooltip', role: 'tooltip' },
    children: [title, ...rows.map(({ row }) => row)],
  });

  let currentAnchor: HTMLElement | undefined;

  const setVisible = (isVisible: boolean): void => {
    root.classList.toggle('tooltip--visible', isVisible);
  };

  function hide(anchor?: HTMLElement): void {
    if (anchor && anchor !== currentAnchor) return;
    setVisible(false);
    currentAnchor?.removeAttribute('aria-describedby');
    currentAnchor = undefined;
  }

  function show(anchor: HTMLElement, ingredient: IIngredient): void {
    hide();

    title.textContent = translate(`ingredient.${ingredient.id}`);
    for (const { key, value: element } of rows) {
      const value = ingredient[key];
      element.textContent = formatSigned(value);
      element.classList.toggle('ingredient_tooltip_value--positive', value > 0);
      element.classList.toggle('ingredient_tooltip_value--negative', value < 0);
    }

    root.style.left = '0px';
    root.style.top = '0px';

    const a = anchor.getBoundingClientRect();
    const t = root.getBoundingClientRect();
    const shelf = (root.parentElement ?? document.body).getBoundingClientRect();

    const isToLeft = a.left + a.width / 2 > shelf.left + shelf.width / 2;

    const bottomEdge = Math.min(shelf.bottom, globalThis.innerHeight);
    const isToUp = bottomEdge - a.bottom < a.height;

    let left: number;
    let top: number;

    if (isToUp) {
      left = isToLeft ? a.right - t.width : a.left;
      top = a.top - GAP - t.height;
    } else {
      left = isToLeft ? a.left - GAP - t.width : a.right + GAP;
      top = a.top;
    }

    left = Math.max(EDGE, Math.min(left, globalThis.innerWidth - t.width - EDGE));
    top = Math.max(EDGE, Math.min(top, globalThis.innerHeight - t.height - EDGE));

    root.classList.toggle('tooltip--left', isToLeft);
    root.classList.toggle('tooltip--up', isToUp);
    root.style.left = `${left}px`;
    root.style.top = `${top}px`;

    currentAnchor = anchor;
    anchor.setAttribute('aria-describedby', 'ingredient-tooltip');
    setVisible(true);
  }

  gameEvents.addEventListener(
    GAME_EVENTS.status,
    () => {
      if (getState().status !== 'playing') hide();
    },
    { signal },
  );

  globalThis.addEventListener('resize', () => hide(), { signal });

  return { element: root, show, hide };
}
