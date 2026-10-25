import { GAME_EVENTS, STATS } from '../../data/game';
import { getSettings, getState } from '../../state/game-state';
import { gameEvents } from '../../state/game-controller';
import { createElement } from '../../utils/helpers';

export function createRecipeSection(): HTMLElement {
  const name = createElement('p', { className: 'recipe__name' });
  const counter = createElement('span', { className: 'recipe__counter' });

  const indicator = createElement('div', {
    className: 'recipe__indicator',
    attributes: { role: 'status', 'aria-live': 'polite' },
    textContent: 'Ingredients in the cauldron: ',
    children: [counter],
  });

  const ranges = {
    temperature: createElement('span', { className: 'recipe__range' }),
    density: createElement('span', { className: 'recipe__range' }),
    magicPower: createElement('span', { className: 'recipe__range' }),
  };

  const list = createElement('ul', {
    className: 'recipe__list',
    children: STATS.map(({ key, label }) =>
      createElement('li', {
        className: 'recipe__item',
        children: [
          createElement('span', { className: 'recipe__stat', textContent: label }),
          ranges[key],
        ],
      }),
    ),
  });

  const section = createElement('section', {
    className: 'recipe',
    children: [
      createElement('h3', { className: 'recipe__title', textContent: 'Current recipe' }),
      name,
      indicator,
      list,
    ],
  });

  function render(): void {
    const { cauldronIngredients, activeRecipe } = getState();
    const count = cauldronIngredients.length;

    counter.textContent = `${count} / ${getSettings().cauldronCapacity}`;
    indicator.classList.toggle('recipe__indicator--full', count >= getSettings().cauldronCapacity);

    if (!activeRecipe) {
      name.textContent = '';
      for (const { key } of STATS) {
        ranges[key].textContent = '';
      }
      return;
    }

    name.textContent = activeRecipe.name;
    for (const { key } of STATS) {
      const { min, max } = activeRecipe[key];
      ranges[key].textContent = `${min} … ${max}`;
    }
  }

  gameEvents.addEventListener(GAME_EVENTS.cauldronIngredients, render);
  gameEvents.addEventListener(GAME_EVENTS.activeRecipe, render);
  gameEvents.addEventListener(GAME_EVENTS.difficulty, render);

  render();

  return section;
}
