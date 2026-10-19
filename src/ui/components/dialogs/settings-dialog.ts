import { DIFFICULTIES } from '../../../data/game';
import { gameActions } from '../../../state/game-controller';
import { getState } from '../../../state/game-state';
import { createElement } from '../../../utils/helpers';
import type { Difficulty } from '../../../utils/types';
import { closeDialog, openDialog } from '../dialog';

const LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export function showSettings(): void {
  const buttons = DIFFICULTIES.map((difficulty) =>
    createElement('button', {
      className: 'dialog__button',
      textContent: LABELS[difficulty],
      attributes: { type: 'button' },
      events: {
        click: () => {
          gameActions.setDifficulty(difficulty);
          render();
        },
      },
    }),
  );

  function render(): void {
    const current = getState().difficulty;

    for (const [index, button] of buttons.entries()) {
      const isSelected = DIFFICULTIES[index] === current;
      button.classList.toggle('dialog__button--accent', isSelected);
      button.classList.toggle('dialog__button--primary', !isSelected);
      button.setAttribute('aria-pressed', String(isSelected));
    }
  }

  render();

  openDialog(
    createElement('h2', { className: 'dialog__title', textContent: 'Difficulty' }),
    createElement('div', {
      className: 'dialog__actions',
      children: [
        ...buttons,
        createElement('button', {
          className: 'dialog__button dialog__button--primary',
          textContent: 'Close',
          attributes: { type: 'button' },
          events: { click: closeDialog },
        }),
      ],
    }),
  );
}
