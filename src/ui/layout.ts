import { createElement } from '../utils/helpers';

export function createMainLayout(): HTMLElement {
  const header = createElement('header', {
    className: 'header',
  });

  const cabinet = createElement('div', {
    className: 'main__cabinet',
  });

  const center = createElement('div', {
    className: 'main__center',
    children: [
      createElement('div', {
        className: 'main__cauldron',
      }),
      createElement('div', {
        className: 'main__actions',
      }),
    ],
  });

  const recipe = createElement('div', {
    className: 'main__recipe',
    attributes: { 'data-slot': 'recipe' },
  });

  const main = createElement('main', {
    className: 'main',
    children: [cabinet, center, recipe],
  });

  return createElement('div', {
    className: 'layout',
    children: [header, main],
  });
}
