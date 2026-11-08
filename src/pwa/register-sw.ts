import { registerSW } from 'virtual:pwa-register';
import { GAME_EVENTS } from '../data/game';
import { gameEvents } from '../state/game-controller';
import { getState } from '../state/game-state';
import { openUpdateDialog } from '../ui/components/dialogs/update-dialog';

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

export function initPwa(): void {
  let isUpdateAvailable = false;
  let swRegistration: ServiceWorkerRegistration | undefined;

  const updateSW = registerSW({
    onNeedRefresh() {
      isUpdateAvailable = true;
      offerUpdate();
    },

    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      swRegistration = registration;

      setInterval(async () => {
        try {
          await registration.update();
        } catch {
          // do nothing: the next check will try again
        }
      }, CHECK_INTERVAL_MS);
    },
  });

  // the promise rejects only if the new version was discarded
  function applyUpdate(): Promise<void> {
    return new Promise((_, reject) => {
      const worker = swRegistration?.waiting;

      // the update was already applied (e.g. in another tab)
      if (!worker) {
        location.reload();
        return;
      }

      worker.addEventListener('statechange', () => {
        if (worker.state === 'redundant') reject(new Error('The new version was discarded'));
      });

      void updateSW(true); // sends SKIP_WAITING to the waiting worker
    });
  }

  function offerUpdate(): void {
    if (isUpdateAvailable && getState().status === 'menu') openUpdateDialog(applyUpdate);
  }

  gameEvents.addEventListener(GAME_EVENTS.status, offerUpdate);
}
