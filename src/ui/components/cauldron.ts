import { createElement } from '../../utils/helpers';

export function createCauldronSection(): HTMLElement {
  const image = createElement('img', {
    className: 'cauldron_img',
    attributes: { src: 'cauldron.gif', alt: 'cauldron', draggable: 'false' },
  });

  const section = createElement('section', {
    className: 'cauldron_container',
    children: [createElement('div', { className: 'cauldron_frame', children: [image] })],
  });

  return section;
}
