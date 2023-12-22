import { defineButton, importButtonStyle } from './button';
import { defineCheckbox, defineCheckboxGroup } from './checkbox';
import { defineCustomRenderer } from './custom-renderer';
import { defineDialog } from './dialog';
import { defineDivider } from './divider';
import { defineForm } from './form';
import { defineFormItem } from './form-item';
import { defineIcon, importIconStyle } from './icon';
import { defineBaseInput, defineInput } from './input';
import { definePopover, importPopoverStyle } from './popover';
import { defineRadio, defineRadioGroup } from './radio';
import { defineSelect, defineSelectOption, defineSelectOptgroup } from './select';
import { defineSpin, importSpinStyle } from './spin';
import { defineSwitch } from './switch';
import { defineTag } from './tag';
import { defineThemeProvider } from './theme-provider';
import { defineTooltip } from './tooltip/Tooltip';
import { defineUpload } from './upload';

export function importAllBasicStyles() {
  importButtonStyle();
  importIconStyle();
  importPopoverStyle();
  importSpinStyle()
}

export function defineAllComponents() {
  if (typeof customElements === 'undefined') return;
  defineButton();
  defineCheckbox();
  defineCheckboxGroup();
  defineCustomRenderer();
  defineDialog();
  defineDivider();
  defineForm();
  defineFormItem();
  defineIcon();
  defineBaseInput();
  defineInput();
  definePopover();
  defineRadio();
  defineRadioGroup();
  defineSelect();
  defineSelectOption();
  defineSelectOptgroup();
  defineSpin();
  defineSwitch();
  defineTag();
  defineThemeProvider();
  defineTooltip();
  defineUpload();
}

export * from './animation';
export * from './button';
export * from './config';
export * from './checkbox';
export * from './custom-renderer';
export * from './dialog';
export * from './divider';
export * from './form';
export * from './form-item';
export * from './icon';
export * from './input';
export * from './popover';
export * from './radio';
export * from './select';
export * from './spin';
export * from './switch';
export * from './tag';
export * from './theme-provider';
export * from './tooltip';
export * from './upload';
