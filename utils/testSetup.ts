import { defineAllComponents } from '../packages/components/index';
import { createElement } from '../packages/utils/index';
import { importAllThemes } from '../packages/theme/index';
import '../packages/core/src/presets/date.dayjs';
import { afterEach } from 'vitest';
import { config } from '@vue/test-utils'

const warn = console.warn.bind(console);

console.warn = (...args: any[]) => {
  if (String(args[0]).includes('Performing full mount instead')) return;
  warn(...args);
}

config.global.config.warnHandler = (msg: string, _: any, trace: string) => {
  // ignore injection not found warning
  if (msg.includes('injection') && msg.includes('not found')) return;
  // vue app validates component name... but we use 'input', 'button' as component name, ignore that
  if (msg.includes('Do not use built-in or reserved')) return;
  // not sure if it needs to be ignored, it occurred since upgraded to vue 3.5
  if (msg.includes('Performing full mount instead')) return;
  console.warn('TEST', msg, msg.includes('Extraneous non-props') || msg.includes('hydrate') ? '\n' + trace : undefined, _);
};

const testAttr = 'data-test',
  persistAttr = 'data-persist';

const l = (name: any, props: any, options: any) => {
  const el = createElement(
    name,
    {
      ...props,
      [testAttr]: 'true',
    },
    options,
  );
  document.body.appendChild(el);
  return el;
};

// @ts-ignore
globalThis.l = l;

importAllThemes();
defineAllComponents();

const persistCount = new WeakMap<Element, number>();

afterEach(() => {
  const specialToRemove = ['l-message', 'l-dialog', 'l-theme-provider', 'l-teleport-holder'];
  const testEls = document.querySelectorAll(`[${testAttr}]`),
    specials = specialToRemove.map((name) => Array.from(document.querySelectorAll(name))).flat();
  Array.from(testEls)
    .concat(specials)
    .forEach((el) => {
      if (el.getAttribute(persistAttr) != null) {
        const count = persistCount.get(el) || 0;
        if (!count) return persistCount.set(el, count + 1);
      }
      el.remove();
    });
});
