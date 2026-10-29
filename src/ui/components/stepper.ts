import { createElement } from '../../utils/helpers';
import { translate } from '../../i18n';

interface StepperOptions<T extends string> {
  label: string;
  values: readonly T[];
  getValue: () => T;
  format: (value: T) => string;
  onChange: (value: T) => void;
}

export function createStepper<T extends string>(options: StepperOptions<T>): HTMLElement {
  const { label, values, getValue, format, onChange } = options;

  const valueElement = createElement('output', {
    className: 'stepper__value',
    attributes: { 'aria-live': 'polite' },
  });

  const refresh = (): void => {
    valueElement.textContent = format(getValue());
  };

  const step = (direction: 1 | -1): void => {
    const index = values.indexOf(getValue());
    const next = values[(index + direction + values.length) % values.length]!;
    onChange(next);
    refresh(); // для языка не важно (страница перезагрузится), для сложности нужно
  };

  const arrow = (direction: 1 | -1, symbol: string, ariaLabel: string): HTMLButtonElement =>
    createElement('button', {
      className: 'stepper__arrow',
      textContent: symbol,
      attributes: { type: 'button', 'aria-label': ariaLabel },
      events: { click: () => step(direction) },
    });

  const control = createElement('div', {
    className: 'stepper',
    attributes: { role: 'group' },
    children: [
      arrow(-1, '‹', translate('settings.prev')),
      valueElement,
      arrow(1, '›', translate('settings.next')),
    ],
    events: {
      keydownement: (event) => {
        const { key } = event as KeyboardEvent;
        if (key === 'ArrowLeft') step(-1);
        else if (key === 'ArrowRight') step(1);
        else return;
        event.preventDefault();
      },
    },
  });

  refresh();

  return createElement('div', {
    className: 'dialog__setting',
    children: [
      createElement('span', { className: 'dialog__setting-label', textContent: label }),
      control,
    ],
  });
}
