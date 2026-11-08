import { translate } from '../../../i18n';
import { createElement } from '../../../utils/helpers';
import { closeDialog, openDialog } from '../dialog';

const RULE_KEYS = [
  'help.rule.ranges',
  'help.rule.add',
  'help.rule.brew',
  'help.rule.tolerance',
  'help.rule.success',
  'help.rule.fail',
  'help.rule.pourOut',
  'help.rule.end',
  'help.rule.keys',
];

export function showHelp(): void {
  openDialog(
    createElement('h2', { className: 'dialog__title', textContent: translate('help.title') }),
    createElement('ul', {
      className: 'dialog__list',
      children: RULE_KEYS.map((key) => {
        const li = document.createElement('li');
        // innerHTML only because the text comes from static dictionaries in the code,
        li.innerHTML = translate(key);
        return li;
      }),
    }),
    createElement('button', {
      className: 'dialog__button dialog__button--primary',
      textContent: translate('help.gotIt'),
      attributes: { type: 'button' },
      events: { click: closeDialog },
    }),
  );
}
