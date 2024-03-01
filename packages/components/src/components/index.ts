import { defineButton } from './button/Button';
import { defineCallout } from './callout/Callout';
import { defineCheckbox } from './checkbox/Checkbox';
import { defineCheckboxGroup } from './checkbox/CheckboxGroup';
import { defineCustomRenderer } from './custom-renderer/CustomRenderer';
import { defineDialog } from './dialog/Dialog';
import { defineDivider } from './divider/Divider';
import { defineForm } from './form/Form';
import { defineFormItem } from './form-item/FormItem';
import { defineIcon, importIconStyle } from './icon/Icon';
import { defineInput } from './input/Input';
import { defineMessage } from './message/Message';
import { definePopover } from './popover/Popover';
import { defineRadio } from './radio/Radio';
import { defineRadioGroup } from './radio/RadioGroup';
import { defineSelect } from './select/Select';
import { defineSelectOptgroup } from './select/SelectOptgroup';
import { defineSelectOption } from './select/SelectOption';
import { defineSpin } from './spin/Spin';
import { defineSwitch } from './switch/Switch';
import { defineTag } from './tag/Tag';
import { defineThemeProvider } from './theme-provider/ThemeProvider';
import { defineTooltip } from './tooltip/Tooltip';
import { defineFilePicker } from './file-picker/FilePicker';
import { defineWatermark } from './watermark/Watermark';
import { importPopoverStyle } from './popover';
import { defineProgress } from './progress/Progress';

export function importAllBasicStyles() {
  importIconStyle();
  importPopoverStyle();
}

export function defineAllComponents() {
  if (typeof customElements === 'undefined') return;
  // found that provide and inject are strongly rely on the dom order of the elements, as in defineCustomElement parent is searched by parentNode and instanceof
  // In SSR, if elements are already in the document and the parent is defined after the child, it will not work
  // So we need to define the providers first
  defineThemeProvider();
  defineWatermark();
  defineForm();
  defineFormItem();
  defineButton();
  defineMessage();
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
  defineFilePicker();
  defineProgress();
}

export * from './animation';
export * from './button';
export * from './callout';
export * from './checkbox';
export * from './config';
export * from './custom-renderer';
export * from './dialog';
export * from './divider';
export * from './file-picker';
export * from './form';
export * from './form-item';
export * from './icon';
export * from './input';
export * from './message';
export * from './popover';
export * from './progress';
export * from './radio';
export * from './select';
export * from './spin';
export * from './switch';
export * from './tag';
export * from './theme-provider';
export * from './tooltip';
export * from './watermark';
