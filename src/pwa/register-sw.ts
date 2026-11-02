import { registerSW } from 'virtual:pwa-register';
import { GAME_EVENTS } from '../data/game';
import { gameEvents } from '../state/game-controller';
import { getState } from '../state/game-state';
import { openUpdateDialog } from '../ui/components/dialogs/update-dialog';

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
const UPDATE_TIMEOUT_MS = 5000;

export function initPwa(): void {
  let isUpdateAvailable = false;

  const updateSW = registerSW({
    onNeedRefresh() {
      isUpdateAvailable = true;
      offerUpdateIfSafe();
    },
    onRegisteredSW(swUrl, registration) {
      if (!registration) return;

      setInterval(async () => {
        if (registration.installing || !navigator.onLine) return;

        const response = await fetch(swUrl, {
          cache: 'no-store',
          headers: { 'cache-control': 'no-cache' },
        });

        if (response.status === 200) await registration.update();
      }, CHECK_INTERVAL_MS);
    },
  });

  async function applyUpdate(): Promise<void> {
    await updateSW(true);
    await new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Update timed out')), UPDATE_TIMEOUT_MS);
    });
  }

  gameEvents.addEventListener(GAME_EVENTS.status, offerUpdateIfSafe);

  function offerUpdateIfSafe(): void {
    if (!isUpdateAvailable) return;
    if (getState().status !== 'menu') return;

    openUpdateDialog(applyUpdate);
  }
}
