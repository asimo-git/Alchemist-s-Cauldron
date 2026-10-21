import { GAME_SIGNALS, INGREDIENT_DRAG_ID } from '../../data/game';
import { canAcceptDrag } from '../../logic/calculate-cauldron';
import { gameActions, gameEvents } from '../../state/game-controller';
import { getState } from '../../state/game-state';
import { createElement } from '../../utils/helpers';
import type { IReactionPopupData } from '../../utils/types';

export function createCauldronSection(): HTMLElement {
  const image = createElement('img', {
    className: 'cauldron_img',
    attributes: { src: 'cauldron.gif', alt: 'cauldron', draggable: 'false' },
  });

  const popups = createElement('div', {
    className: 'cauldron_popups',
    attributes: { 'aria-live': 'polite' },
  });

  const section = createElement('section', {
    className: 'cauldron_container',
    children: [createElement('div', { className: 'cauldron_frame', children: [image] }), popups],
  });

  // ---- Reaction popup  ----
  const showReactions = (reactions: IReactionPopupData[]): void => {
    const popup = createElement('div', {
      className: 'reaction-popup',
      attributes: { role: 'status' },
      children: [
        createElement('h3', {
          className: 'reaction-popup_title',
          textContent: 'A chemical reaction happened!',
        }),
        ...reactions.map(({ name, lines }) =>
          createElement('p', {
            className: 'reaction-popup_line',
            textContent: `✠ ${name}: ${lines.join(', ')}`,
          }),
        ),
      ],
    });

    popup.addEventListener('animationend', (event) => {
      if (event.target === popup) popup.remove();
    });

    popups.replaceChildren(popup);
  };

  gameEvents.addEventListener(GAME_SIGNALS.reactionFired, (event) => {
    showReactions((event as CustomEvent<IReactionPopupData[]>).detail);
  });

  gameEvents.addEventListener(GAME_SIGNALS.gameBegun, () => popups.replaceChildren());
  // ---- ---- -------- ---- -------- ---- -------- ---- -------- ---- ----

  const setDropActive = (isActive: boolean): void => {
    section.classList.toggle('cauldron_container_drop-active', isActive);
  };

  section.addEventListener('dragover', (event) => {
    if (!canAcceptDrag(event)) {
      setDropActive(false);
      return;
    }

    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
    setDropActive(true);
  });

  section.addEventListener('dragleave', (event) => {
    if (event.relatedTarget instanceof Node && section.contains(event.relatedTarget)) return;
    setDropActive(false);
  });

  section.addEventListener('drop', (event) => {
    event.preventDefault();
    setDropActive(false);

    if (!canAcceptDrag(event)) return;

    const id = event.dataTransfer?.getData(INGREDIENT_DRAG_ID);
    if (!id) return;

    if ((getState().shelfStock[id] ?? 0) <= 0) return;

    gameActions.addToCauldron(id);
  });

  // ---- TEST: показать попап сразу при создании котла ----
  // showReactions([
  //   { name: 'Bubbling', lines: ['Magic Power +50%', '-10 seconds'] },
  //   { name: 'Solar Frost', lines: ['Temperature set to 0', 'Density +20%'] },
  // ]);

  return section;
}
