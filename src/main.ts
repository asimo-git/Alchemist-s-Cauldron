import './styles/main.scss';
import { createMainLayout } from './ui/layout';

function createRoot(): HTMLElement {
  const root = document.createElement('div');
  root.id = 'app';
  document.body.append(root);
  return root;
}

function renderApp(root: HTMLElement) {
  root.append(createMainLayout());
}

const root = createRoot();
renderApp(root);
