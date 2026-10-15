import { gameActions } from '../../../state/game-state';
import { createElement } from '../../../utils/helpers';
import { closeDialog, openDialog } from '../dialog';

export function openPauseDialog(): void {
  const resumeButton = createElement('button', {
    className: 'dialog__button dialog__button--primary',
    textContent: 'Resume',
    attributes: { type: 'button' },
    events: { click: closeDialog },
  });

  const exitButton = createElement('button', {
    className: 'dialog__button',
    textContent: 'Exit to Menu',
    attributes: { type: 'button' },
    events: {
      click: () => {
        gameActions.exitToMenu();
        closeDialog();
      },
    },
  });

  openDialog(
    createElement('h2', { className: 'dialog__title', textContent: 'Paused' }),
    createElement('div', {
      className: 'dialog__actions',
      children: [resumeButton, exitButton],
    }),
  );
}
