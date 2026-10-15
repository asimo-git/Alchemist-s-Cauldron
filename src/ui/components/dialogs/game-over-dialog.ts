import { isOutOfIngredients } from '../../../logic/stock';
import { gameActions, getState } from '../../../state/game-state';
import { createElement } from '../../../utils/helpers';
import { closeDialog, openDialog } from '../dialog';

export function openGameOverDialog(): void {
  const state = getState();

  openDialog(
    createElement('h2', {
      className: 'dialog__title',
      textContent: isOutOfIngredients(state) ? 'Out of Ingredients Game Over' : 'Game Over',
    }),
    createElement('p', { className: 'dialog__text', textContent: 'Final score' }),
    createElement('p', { className: 'dialog__score', textContent: String(state.score) }),
    createElement('button', {
      className: 'dialog__button',
      textContent: 'Play again',
      attributes: { type: 'button' },
      events: {
        click: () => {
          closeDialog();
          gameActions.startNewGame();
        },
      },
    }),
  );
}
