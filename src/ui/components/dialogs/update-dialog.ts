import { translate } from '../../../i18n';
import { createElement } from '../../../utils/helpers';
import { closeDialog, openDialog } from '../dialog';

export function openUpdateDialog(onUpdate: () => Promise<void>): void {
  const status = createElement('p', {
    className: 'dialog__text',
    attributes: { role: 'status' },
  });

  const updateButton = createElement('button', {
    className: 'dialog__button--accent',
    textContent: translate('updateDialog.update'),
    events: {
      click: async () => {
        updateButton.textContent = translate('updateDialog.updating');
        updateButton.disabled = true;

        try {
          await onUpdate();
        } catch {
          status.textContent = translate('updateDialog.failed');
          updateButton.textContent = translate('updateDialog.retry');
          updateButton.disabled = false;
        }
      },
    },
  });

  openDialog(
    createElement('h2', {
      className: 'dialog__title',
      textContent: translate('updateDialog.title'),
    }),
    createElement('p', {
      className: 'dialog__text',
      textContent: translate('updateDialog.text'),
    }),
    status,
    updateButton,
    createElement('button', {
      className: 'dialog__button--primary',
      textContent: translate('updateDialog.later'),
      events: { click: closeDialog },
    }),
  );
}
