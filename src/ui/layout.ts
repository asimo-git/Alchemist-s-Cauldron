import { createElement } from '../utils/helpers';
import { createCauldronSection } from './components/cauldron';
import { createMainActions } from './components/main-actions';
import { createShelfSection } from './components/shelf';

export function createMainLayout(): HTMLElement {
  const header = createElement('header', {
    className: 'header',
  });

  const center = createElement('div', {
    className: 'main__center',
    children: [createCauldronSection(), createMainActions()],
  });

  const recipe = createElement('div', {
    className: 'main__recipe',
    attributes: { 'data-slot': 'recipe' },
  });

  const main = createElement('main', {
    className: 'main',
    children: [createShelfSection(), center, recipe],
  });

  return createElement('div', {
    className: 'layout',
    children: [header, main],
  });
}
