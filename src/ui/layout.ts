import { createElement } from '../utils/helpers';
import { createCauldronSection } from './components/cauldron';
import { createHeader } from './components/header';
import { createMainActions } from './components/main-actions';
import { createRecipeSection } from './components/recipe';
import { createShelfSection } from './components/shelf';

export function createMainLayout(): HTMLElement {
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
    children: [createHeader(), main],
  });
}
