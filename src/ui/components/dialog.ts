import { gameActions } from '../../state/game-controller';
import { createElement } from '../../utils/helpers';

const windowElement = createElement('div', { className: 'dialog__window' });

const dialog = createElement('dialog', {
  className: 'dialog',
  children: [windowElement],
  events: {
    click: (event) => {
      if (event.target === dialog) dialog.close();
    },

    close: () => {
      document.body.style.overflow = '';
      windowElement.replaceChildren();
      gameActions.resumeGame();
    },
  },
});

export function openDialog(...content: HTMLElement[]): void {
  windowElement.replaceChildren(...content);
  document.body.style.overflow = 'hidden';

  if (!dialog.isConnected) document.body.append(dialog);
  if (!dialog.open) {
    // gameActions.pauseGame();
    dialog.showModal();
  }
}

export const closeDialog = (): void => dialog.close();
