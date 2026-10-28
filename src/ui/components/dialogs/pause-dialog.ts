import { translate } from '../../../i18n';
import { gameActions } from '../../../state/game-controller';
import { createElement } from '../../../utils/helpers';
import { closeDialog, openDialog } from '../dialog';

export function openPauseDialog(): void {
  const resumeButton = createElement('button', {
    className: 'dialog__button dialog__button--accent',
    textContent: translate('pause.resume'),
    attributes: { type: 'button' },
    events: { click: closeDialog },
  });

  const exitButton = createElement('button', {
    className: 'dialog__button--primary',
    textContent: translate('pause.exit'),
    attributes: { type: 'button' },
    events: { click: openExitConfirmDialog },
  });

  openDialog(
    createElement('h2', {
      className: 'dialog__title',
      textContent: translate('dialog.pause.title'),
    }),
    createElement('div', {
      className: 'dialog__actions',
      children: [resumeButton, exitButton],
    }),
  );
}

export function openExitConfirmDialog(): void {
  const cancelButton = createElement('button', {
    className: 'dialog__button--primary',
    textContent: translate('common.cancel'),
    attributes: { type: 'button' },
    events: { click: openPauseDialog },
  });

  const confirmButton = createElement('button', {
    className: 'dialog__button dialog__button--accent',
    textContent: translate('pause.exitConfirm.exit'),
    attributes: { type: 'button' },
    events: {
      click: () => {
        gameActions.exitToMenu();
        closeDialog();
      },
    },
  });

  openDialog(
    createElement('h2', {
      className: 'dialog__title',
      textContent: translate('pause.exitConfirm.title'),
    }),
    createElement('p', {
      className: 'dialog__text',
      textContent: translate('pause.exitConfirm.text'),
    }),
    createElement('div', {
      className: 'dialog__actions',
      children: [cancelButton, confirmButton],
    }),
  );

  cancelButton.focus();
}
