import { defineButton } from './button';
import { defineCheckbox, defineCheckboxGroup } from './checkbox';
import { defineCustomRenderer } from './custom-renderer';
import { defineIcon } from './icon';
import { defineBaseInput, defineInput } from './input';
import { defineRadio, defineRadioGroup } from './radio';
import { defineSpin } from './spin';

export function defineAllComponents() {
  if (typeof customElements === 'undefined') return;
  defineButton();
  defineCheckbox();
  defineCheckboxGroup();
  defineCustomRenderer();
  defineIcon();
  defineBaseInput();
  defineInput();
  defineRadio();
  defineRadioGroup();
  defineSpin();
}

export * from './animation';
export * from './button';
export * from './config';
export * from './checkbox';
export * from './custom-renderer';
export * from './input';
export * from './radio';
export * from './icon';
export * from './spin';