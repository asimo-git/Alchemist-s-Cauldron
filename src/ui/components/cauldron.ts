import { createElement } from '../../utils/helpers';

export function createCauldronSection(): HTMLElement {
  const Cauldron = createElement('section', {
    className: 'cauldron_container',
    children: [
      createElement('img', {
        className: 'cauldron_img',
        attributes: { src: 'cauldron.gif', alt: 'cauldron' },
      }),
    ],
  });

  return Cauldron;
}
