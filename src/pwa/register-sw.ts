import { registerSW } from 'virtual:pwa-register';
import { GAME_EVENTS } from '../data/game';
import { gameEvents } from '../state/game-controller';
import { getState } from '../state/game-state';
import { openUpdateDialog } from '../ui/components/dialogs/update-dialog';

export function initPwa(): void {
  let isUpdateAvailable = false;
  let isBannerVisible = false;

  const updateSW = registerSW({
    onNeedRefresh() {
      isUpdateAvailable = true;
      offerUpdateIfSafe();
    },
  });

  gameEvents.addEventListener(GAME_EVENTS.status, offerUpdateIfSafe);

  function offerUpdateIfSafe(): void {
    if (!isUpdateAvailable || isBannerVisible) return;
    if (getState().status !== 'menu') return;

    isBannerVisible = true;
    openUpdateDialog(() => void updateSW(true));
  }
}
