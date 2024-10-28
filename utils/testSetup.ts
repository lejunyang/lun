import { defineAllComponents } from '../packages/components/index';
import { createElement } from '../packages/utils/index';
import { importAllThemes } from '../packages/theme/index';
import '../packages/core/src/presets/date.dayjs';
import { afterEach } from 'vitest';

const testAttr = 'data-test';

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

afterEach(() => {
  const testEls = document.querySelectorAll(`[${testAttr}]`);
  testEls.forEach((el) => el.remove());
});
