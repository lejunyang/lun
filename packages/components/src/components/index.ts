import { defineButton } from './button';
import { defineCheckbox, defineCheckboxGroup } from './checkbox';
import { defineCustomRenderer } from './custom-renderer';
import { defineIcon } from './icon';
import { defineBaseInput, defineInput } from './input';
import { definePopover, importPopoverStyle } from './popover';
import { defineRadio, defineRadioGroup } from './radio';
import { defineSelect, defineSelectOption, defineSelectOptGroup } from './select';
import { defineSpin } from './spin';
import { defineThemeProvider } from './theme-provider';

export function importAllBasicStyles() {
  importPopoverStyle();
}

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
  defineSelect();
  defineSelectOption();
  defineSelectOptGroup();
  defineSpin();
  defineThemeProvider();
}

export * from './animation';
export * from './button';
export * from './config';
export * from './checkbox';
export * from './custom-renderer';
export * from './icon';
export * from './input';
export * from './popover';
export * from './radio';
export * from './select';
export * from './spin';
