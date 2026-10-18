import { createElement } from '../../../utils/helpers';
import { closeDialog, openDialog } from '../dialog';
import { showHelp } from './help-dialog';
import { showLeaderboard } from './leaderboard-dialog';
import { showSettings } from './settings-dialog';

const ITEMS = [
  { label: 'Help', open: showHelp },
  { label: 'Settings', open: showSettings },
  { label: 'Leaderboard', open: showLeaderboard },
];

export function showMenu(): void {
  openDialog(
    createElement('h2', { className: 'dialog__title', textContent: 'Menu' }),
    createElement('div', {
      className: 'dialog__actions',
      children: [
        ...ITEMS.map(({ label, open }) =>
          createElement('button', {
            className: 'dialog__button dialog__button--primary',
            textContent: label,
            attributes: { type: 'button' },
            events: { click: () => open() },
          }),
        ),
        createElement('button', {
          className: 'dialog__button dialog__button--accent',
          textContent: 'Close',
          attributes: { type: 'button' },
          events: { click: closeDialog },
        }),
      ],
    }),
  );
}
