export interface CreateElementOptions {
  className?: string;
  textContent?: string;
  attributes?: Record<string, string>;
  children?: Node[];
  events?: Record<string, EventListener>;
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options: CreateElementOptions = {},
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);

  const { className, textContent, attributes, children, events } = options;

  if (className) {
    element.className = className;
  }

  if (textContent !== undefined) {
    element.textContent = textContent;
  }

  if (attributes) {
    for (const [name, value] of Object.entries(attributes)) {
      element.setAttribute(name, value);
    }
  }

  if (events) {
    for (const [type, listener] of Object.entries(events)) {
      element.addEventListener(type, listener);
    }
  }

  if (children) {
    element.append(...children);
  }

  return element;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
