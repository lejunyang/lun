import { defineButton } from './button';
import { defineCheckbox, defineCheckboxGroup } from './checkbox';
import { defineCustomRenderer } from './custom-renderer';
import { defineIcon } from './icon';
import { defineBaseInput, defineInput } from './input';
import { definePopover } from './popover';
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
  definePopover();
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
export * from './popover';
export * from './radio';
export * from './icon';
export * from './spin';
