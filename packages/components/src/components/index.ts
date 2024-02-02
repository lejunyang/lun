import { defineButton, importButtonStyle } from './button';
import { defineCallout } from './callout/Callout';
import { defineCheckbox, defineCheckboxGroup } from './checkbox';
import { defineCustomRenderer } from './custom-renderer';
import { defineDialog } from './dialog';
import { defineDivider } from './divider';
import { defineForm } from './form';
import { defineFormItem } from './form-item';
import { defineIcon, importIconStyle } from './icon';
import { defineInput } from './input';
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
  importSpinStyle();
}

export function defineAllComponents() {
  if (typeof customElements === 'undefined') return;
  // found that provide and inject are strongly rely on the dom order of the elements, as in defineCustomElement parent is searched by parentNode and instanceof
  // In SSR, if elements are already in the document and the parent is defined after the child, it will not work
  // So we need to define the providers first
  defineThemeProvider();
  defineForm();
  defineFormItem();
  defineButton();
  defineCallout();
  defineCheckboxGroup();
  defineCheckbox();
  defineCustomRenderer();
  defineDialog();
  defineDivider();
  defineIcon();
  defineInput();
  definePopover();
  defineRadioGroup();
  defineRadio();
  defineSelect();
  defineSelectOptgroup();
  defineSelectOption();
  defineSpin();
  defineSwitch();
  defineTag();
  defineTooltip();
  defineUpload();
}

export * from './animation';
export * from './button';
export * from './callout';
export * from './checkbox';
export * from './config';
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