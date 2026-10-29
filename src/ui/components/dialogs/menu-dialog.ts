import { translate } from '../../../i18n';
import { createElement } from '../../../utils/helpers';
import { closeDialog, openDialog } from '../dialog';
import { showHelp } from './help-dialog';
import { showLeaderboard } from './leaderboard-dialog';
import { showSettings } from './settings-dialog';

const ITEMS = [
  { labelKey: 'header.help', open: showHelp },
  { labelKey: 'settings.title', open: showSettings },
  { labelKey: 'menu.leaderboard', open: showLeaderboard },
];

export function showMenu(): void {
  openDialog(
    createElement('h2', { className: 'dialog__title', textContent: translate('header.menu') }),
    createElement('div', {
      className: 'dialog__actions',
      children: [
        ...ITEMS.map(({ labelKey, open }) =>
          createElement('button', {
            className: 'dialog__button dialog__button--primary',
            textContent: translate(labelKey),
            attributes: { type: 'button' },
            events: { click: () => open() },
          }),
        ),
        createElement('button', {
          className: 'dialog__button dialog__button--accent',
          textContent: translate('common.close'),
          attributes: { type: 'button' },
          events: { click: closeDialog },
        }),
      ],
    }),
  );
}
