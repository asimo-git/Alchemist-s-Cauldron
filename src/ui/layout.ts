import { createElement } from '../utils/helpers';
import { createCauldronSection } from './components/cauldron';
import { createMainActions } from './components/main-actions';
import { createRecipeSection } from './components/recipe';
import { createShelfSection } from './components/shelf';

export function createMainLayout(): HTMLElement {
  const header = createElement('header', {
    className: 'header',
  });

  const center = createElement('div', {
    className: 'main__center',
    children: [createCauldronSection(), createMainActions()],
  });

  const main = createElement('main', {
    className: 'main',
    children: [createShelfSection(), center, createRecipeSection()],
  });

  return createElement('div', {
    className: 'layout',
    children: [header, main],
  });
}
