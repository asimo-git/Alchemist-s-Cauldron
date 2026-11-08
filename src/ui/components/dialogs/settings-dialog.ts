import { DIFFICULTIES } from '../../../data/game';
import { getLocale, LOCALES, setLocale, translate, type Locale } from '../../../i18n';
import { gameActions } from '../../../state/game-controller';
import { getState } from '../../../state/game-state';
import { createElement } from '../../../utils/helpers';
import type { Difficulty } from '../../../utils/types';
import { closeDialog, openDialog } from '../dialog';
import { createStepper } from '../stepper';

const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
};

export function showSettings(): void {
  let pendingLocale: Locale = getLocale();

  function applyLocale(): void {
    if (pendingLocale !== getLocale()) setLocale(pendingLocale);
  }

  const difficulty = createStepper<Difficulty>({
    label: translate('settings.difficulty'),
    values: DIFFICULTIES,
    getValue: () => getState().difficulty,
    format: (value) => translate(`difficulty.${value}`),
    onChange: gameActions.setDifficulty,
  });

  const language = createStepper<Locale>({
    label: translate('settings.language'),
    values: Object.keys(LOCALES) as Locale[],
    getValue: () => pendingLocale,
    format: (value) => LOCALE_NAMES[value],
    onChange: (value) => {
      pendingLocale = value;
    },
  });

  const button = createElement('button', {
    className: 'dialog__button dialog__button--primary',
    textContent: translate('settings.apply'),
    attributes: { type: 'button' },
    events: {
      click: () => {
        closeDialog();
        applyLocale();
      },
    },
  });

  openDialog(
    createElement('h2', { className: 'dialog__title', textContent: translate('settings.title') }),
    createElement('div', {
      className: 'dialog__actions',
      children: [difficulty, language, button],
    }),
  );

  language.closest('dialog')?.addEventListener('close', applyLocale, { once: true });
}
