import { createElement } from '../../../utils/helpers';
import { closeDialog, openDialog } from '../dialog';

const RULES = [
  'Each recipe asks for <strong>Temperature</strong>, <strong>Density</strong> and <strong>Magic Power</strong> to fall inside target ranges.',
  'Click ingredients on the shelf to add them to the cauldron. Its capacity is limited.',
  'When you think the mix matches the recipe, press the <strong>Brew</strong> button or the <strong>B</strong> key.',
  'A correct brew gives you points and extra time, and you get a new recipe.',
  'A wrong brew costs one life and empties the cauldron.',
  'You can empty the cauldron at any time with the <strong>Pour Out</strong> button or the <strong>X</strong> key. This costs you some time, and the ingredients are spent — they are not returned.',
  'The game ends when time runs out, you lose all lives, or the shelf has no ingredients left.',
  'Press <strong>Esc</strong> or <strong>P</strong> to pause the game, <strong>M</strong> to exit to the menu.',
];

export function showHelp(): void {
  openDialog(
    createElement('h2', { className: 'dialog__title', textContent: 'How to play' }),
    createElement('ul', {
      className: 'dialog__list',
      children: RULES.map((rule) => {
        const li = document.createElement('li');
        // innerHTML only because it's a static constant in the code, not a template
        li.innerHTML = rule;
        return li;
      }),
    }),
    createElement('button', {
      className: 'dialog__button dialog__button--primary',
      textContent: 'Got it',
      attributes: { type: 'button' },
      events: { click: closeDialog },
    }),
  );
}
