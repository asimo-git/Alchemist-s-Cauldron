import { gameActions } from '../state/game-controller';
import { getState } from '../state/game-state';
import { openExitConfirmDialog } from '../ui/components/dialogs/pause-dialog';

const SHORTCUTS: Record<string, () => void> = {
  Escape: () => gameActions.pauseGame(),
  KeyP: () => gameActions.pauseGame(),
  Pause: () => gameActions.pauseGame(),
  KeyB: () => gameActions.brew(),
  KeyX: () => gameActions.pourOut(),
  KeyM: () => {
    gameActions.pauseGame();
    openExitConfirmDialog();
  },
};

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || target.matches('input, textarea, select'))
  );
}

export function initKeyboardControls(): void {
  document.addEventListener('keydown', (event) => {
    if (getState().status !== 'playing') return;
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    if (isTypingTarget(event.target)) return;
    if (document.querySelector('dialog[open]')) return;

    const action = SHORTCUTS[event.code];
    if (!action) return;
    event.preventDefault();
    action();
  });
}
