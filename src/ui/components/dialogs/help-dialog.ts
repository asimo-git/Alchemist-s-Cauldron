import { createElement } from '../../../utils/helpers';
import { closeDialog, openDialog } from '../dialog';

const RULES = [
  'Each recipe asks for Temperature, Density and Magic Power to fall inside target ranges.',
  'Click ingredients on the shelf to add them to the cauldron. Its capacity is limited.',
  'Press Brew when you think the mix matches the recipe.',
  'A correct brew gives you points and extra time, and you get a new recipe.',
  'A wrong brew costs one life and empties the cauldron.',
  'The game ends when time runs out, you lose all lives, or the shelf has no ingredients left.',
  'Press Esc to pause the game.',
];

export function showHelp(): void {
  openDialog(
    createElement('h2', { className: 'dialog__title', textContent: 'How to play' }),
    createElement('ul', {
      className: 'dialog__list',
      children: RULES.map((rule) => createElement('li', { textContent: rule })),
    }),
    createElement('button', {
      className: 'dialog__button dialog__button--primary',
      textContent: 'Got it',
      attributes: { type: 'button' },
      events: { click: closeDialog },
    }),
  );
}
