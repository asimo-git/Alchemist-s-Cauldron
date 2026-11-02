import { translate } from '../../../i18n';
import { createElement } from '../../../utils/helpers';
import { closeDialog, openDialog } from '../dialog';

export function openUpdateDialog(onUpdate: () => void): void {
  openDialog(
    createElement('h2', {
      className: 'dialog__title',
      textContent: translate('updateDialog.title'),
    }),
    createElement('p', {
      className: 'dialog__text',
      textContent: translate('updateDialog.text'),
    }),
    createElement('button', {
      className: 'dialog__button--accent',
      textContent: translate('updateDialog.update'),
      events: { click: onUpdate },
    }),
    createElement('button', {
      className: 'dialog__button--primary',
      textContent: translate('updateDialog.later'),
      events: { click: closeDialog },
    }),
  );
}
