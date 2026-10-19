import { INGREDIENT_DRAG_ID } from '../../data/game';
import { canAcceptDrag } from '../../logic/calculate-cauldron';
import { gameActions } from '../../state/game-controller';
import { getState } from '../../state/game-state';
import { createElement } from '../../utils/helpers';

export function createCauldronSection(): HTMLElement {
  const image = createElement('img', {
    className: 'cauldron_img',
    attributes: { src: 'cauldron.gif', alt: 'cauldron', draggable: 'false' },
  });

  const section = createElement('section', {
    className: 'cauldron_container',
    children: [createElement('div', { className: 'cauldron_frame', children: [image] })],
  });

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
