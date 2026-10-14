import { createElement } from '../utils/helpers';
import { createCauldronSection } from './components/cauldron';
import { createMainActions } from './components/main-actions';
import { createRecipeSection } from './components/recipe';
import { createShelfSection } from './components/shelf';
import { createTimer } from './components/timer';

export function createMainLayout(): HTMLElement {
  const header = createElement('header', {
    className: 'header',
    children: [
      createElement('div', { className: 'header__side' }),
      createTimer(),
      createElement('div', { className: 'header__side' }),
    ],
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
