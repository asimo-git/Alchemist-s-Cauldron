import { GAME_EVENTS, GAME_SIGNALS, INGREDIENT_DRAG_ID } from '../../data/game';
import { canAcceptDrag } from '../../logic/calculate-cauldron';
import { gameActions, gameEvents } from '../../state/game-controller';
import { getSettings, getState } from '../../state/game-state';
import { createElement } from '../../utils/helpers';
import type { IIngredient, IReactionPopupData } from '../../utils/types';

const RESULT_CLASSES = {
  success: 'cauldron_frame_success',
  fail: 'cauldron_frame_fail',
};

export function createCauldronSection(): HTMLElement {
  const cauldronFrame = createCauldronFrame();

  const popups = createElement('div', {
    className: 'cauldron_popups',
    attributes: { 'aria-live': 'polite' },
  });

  const floatingIngredients = createElement('div', {
    className: 'cauldron_ingredients',
    attributes: { 'aria-hidden': 'true' },
  });

  const section = createElement('section', {
    className: 'cauldron_container',
    children: [cauldronFrame, floatingIngredients, popups],
  });

  // ---- Events ----

  gameEvents.addEventListener(GAME_SIGNALS.brewSuccess, () => {
    playBrewResult(cauldronFrame, 'success');
    const seconds = getSettings().timeBonus;
    if (seconds > 0) section.append(createTimeBonus(seconds));
  });

  gameEvents.addEventListener(GAME_SIGNALS.brewFailed, () => {
    playBrewResult(cauldronFrame, 'fail');
  });

  gameEvents.addEventListener(GAME_SIGNALS.reactionFired, (event) => {
    const reactions = (event as CustomEvent<IReactionPopupData[]>).detail;
    popups.replaceChildren(createReactionPopup(reactions));
  });

  gameEvents.addEventListener(GAME_SIGNALS.gameBegun, () => {
    popups.replaceChildren();
    cauldronFrame.classList.remove(...Object.values(RESULT_CLASSES));
    floatingIngredients.replaceChildren();
  });

  gameEvents.addEventListener(GAME_EVENTS.cauldronIngredients, () => {
    syncFloatingIngredients(floatingIngredients);
  });

  // ---- Drag & drop ----

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

  return section;
}

function createCauldronFrame(): HTMLElement {
  const frame = createElement('div', {
    className: 'cauldron_frame',
    children: [
      createElement('img', {
        className: 'cauldron_img',
        attributes: { src: 'cauldron.gif', alt: 'cauldron', draggable: 'false' },
      }),
    ],
    events: {
      animationend: (event) => {
        if (
          event.target === frame &&
          event instanceof AnimationEvent &&
          event.animationName === 'cauldron-glow'
        ) {
          frame.classList.remove(...Object.values(RESULT_CLASSES));
        }
      },
    },
  });

  return frame;
}

function playBrewResult(frame: HTMLElement, result: keyof typeof RESULT_CLASSES): void {
  frame.classList.remove(...Object.values(RESULT_CLASSES));
  void frame.offsetWidth;
  frame.classList.add(RESULT_CLASSES[result]);
}

// ---------- Time bonus ----------

function createTimeBonus(seconds: number): HTMLElement {
  const timeBonus = createElement('div', {
    className: 'cauldron_time-bonus',
    textContent: `+${seconds}s`,
  });

  timeBonus.addEventListener('animationend', () => timeBonus.remove());

  return timeBonus;
}

// ---------- Reaction popup ----------

function createReactionPopup(reactions: IReactionPopupData[]): HTMLElement {
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

  return popup;
}

// ---------- Floating ingredients ----------

function syncFloatingIngredients(layer: HTMLElement): void {
  const { cauldronIngredients } = getState();

  while (layer.childElementCount > cauldronIngredients.length) {
    layer.lastElementChild?.remove();
  }

  for (let index = layer.childElementCount; index < cauldronIngredients.length; index++) {
    layer.append(createFloatingIngredient(cauldronIngredients[index]!));
  }
}

function createFloatingIngredient(ingredient: IIngredient): HTMLElement {
  return createElement('img', {
    className: 'cauldron_ingredient',
    attributes: { src: ingredient.icon, alt: '', draggable: 'false' },
  });
}
