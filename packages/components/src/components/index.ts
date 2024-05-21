import { defineButton } from './button/Button';
import { defineCallout } from './callout/Callout';
import { defineCheckbox } from './checkbox/Checkbox';
import { defineCheckboxGroup } from './checkbox/CheckboxGroup';
import { defineCustomRenderer } from './custom-renderer/CustomRenderer';
import { defineDialog } from './dialog/Dialog';
import { defineDivider } from './divider/Divider';
import { defineForm } from './form/Form';
import { defineFormItem } from './form-item/FormItem';
import { defineIcon } from './icon/Icon';
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
import { defineProgress } from './progress/Progress';
import { defineTextarea } from './textarea/Textarea';
import { defineTeleportHolder } from './teleport-holder/TeleportHolder';
import { once, supportCustomElement } from '@lun/utils';
import { GlobalStaticConfig, components } from './config';
import { defineMentions } from './mentions/Mentions';
import { defineDocPip } from './doc-pip';
import { defineRange } from './range/Range';

export function defineAllComponents() {
  if (!supportCustomElement) return;
  // found that provide and inject are strongly rely on the dom order of the elements, as in defineCustomElement parent is searched by parentNode and instanceof
  // In SSR, if elements are already in the document and the parent is defined after the child, it will not work
  // So we need to define the providers first
  defineWatermark();
  defineThemeProvider();
  defineTeleportHolder();
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
  defineRange();
  defineSelect();
  defineSelectOptgroup();
  defineSelectOption();
  defineSpin();
  defineSwitch();
  defineTag();
  defineTooltip();
  defineFilePicker();
  defineProgress();
  defineTextarea();
  defineMentions();
  defineDocPip();
}

export const __internal_defineSubscriber: ((componentName: string) => void)[] = [];
export const autoDefine = once(() => {
  const { namespace, defaultProps } = GlobalStaticConfig;
  const undefinedSet = new Set();
  components.forEach((comp) => {
    const tagName = namespace + '-' + comp;
    if (!customElements.get(tagName)) {
      undefinedSet.add(comp);
      customElements.whenDefined(tagName).then(() => {
        undefinedSet.delete(comp);
        if (!undefinedSet.size) {
          observer.disconnect();
        }
      });
    }
  });
  const discover = (root: Element) => {
    const rootTagName = root.tagName.toLowerCase();
    const prefix = namespace + '-';
    const rootIsLunElement = rootTagName.startsWith(prefix);
    const reg = new RegExp(`^${prefix}`);
    const componentNames = [...root.querySelectorAll(':not(:defined)')].flatMap((el) => {
      const name = el.tagName.toLowerCase().replace(reg, '');
      return name in defaultProps ? [name] : [];
    });

    if (rootIsLunElement && !customElements.get(rootTagName)) {
      componentNames.unshift(rootTagName.replace(reg, ''));
    }
    const componentsToRegister = [...new Set(componentNames)];
    return componentsToRegister.map((componentName) => {
      __internal_defineSubscriber.forEach((f) => f(componentName));
      return import(`./${componentName}/${componentName}.define.ts`).catch(() => {
        // some components may not have define.ts file, like radio-group
      });
    });
  };
  const observer = new MutationObserver((mutations) => {
    for (const { addedNodes } of mutations) {
      for (const node of addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          discover(node as Element);
        }
      }
    }
  });
  observer.observe(document.documentElement, { subtree: true, childList: true });
  discover(document.body);
});

export * from './animation';
export * from './button';
export * from './callout';
export * from './checkbox';
export * from './config';
export * from './custom-renderer';
export * from './dialog';
export * from './divider';
export * from './doc-pip';
export * from './file-picker';
export * from './form';
export * from './form-item';
export * from './icon';
export * from './input';
export * from './mentions';
export * from './message';
export * from './popover';
export * from './progress';
export * from './radio';
export * from './range';
export * from './select';
export * from './spin';
export * from './switch';
export * from './tag';
export * from './teleport-holder';
export * from './textarea';
export * from './theme-provider';
export * from './tooltip';
export * from './watermark';
