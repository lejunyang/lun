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
import { capitalize, getDocumentElement, isElement, once, supportCustomElement } from '@lun-web/utils';
import { GlobalStaticConfig, components } from './config';
import { defineMentions } from './mentions/Mentions';
import { defineDocPip } from './doc-pip';
import { defineRange } from './range/Range';
import { defineCalendar } from './calendar';
import { defineDatePicker } from './date-picker';
import { defineTour } from './tour/Tour';
import { defineColorPicker } from './color-picker';
import { defineTabs, defineTabItem } from './tabs';
import { defineAccordion, defineAccordionGroup } from './accordion';
import { camelize } from 'vue';
import { defineText } from './text/Text';
import { defineSkeleton } from './skeleton';
import { defineVirtualRenderer } from './virtual-renderer';
import { defineScrollView } from './scroll-view';
import { defineTree, defineTreeItem } from './tree';
import { defineTable } from './table/Table';
import { defineTableColumn } from './table/TableColumn';

export function defineAllComponents() {
  if (!supportCustomElement) return;
  // found that provide and inject are strongly rely on the dom order of the elements, as in defineCustomElement parent is searched by parentNode and instanceof
  // In SSR, if elements are already in the document and the parent is defined after the child, it will not work
  // So we need to define the providers first
  const comps = {
    defineWatermark,
    defineThemeProvider,
    defineTeleportHolder,
    defineAccordionGroup,
    defineAccordion,
    defineTable,
    defineTableColumn,
    defineTabs,
    defineTabItem,
    defineForm,
    defineFormItem,
    defineButton,
    defineMessage,
    defineCalendar,
    defineCallout,
    defineCheckboxGroup,
    defineCheckbox,
    defineCustomRenderer,
    defineDatePicker,
    defineDialog,
    defineDivider,
    defineIcon,
    defineInput,
    definePopover,
    defineRadioGroup,
    defineRadio,
    defineRange,
    defineSelect,
    defineSelectOptgroup,
    defineSelectOption,
    defineSpin,
    defineSwitch,
    defineTag,
    defineTooltip,
    defineFilePicker,
    defineProgress,
    defineTextarea,
    defineMentions,
    defineDocPip,
    defineTour,
    defineColorPicker,
    defineText,
    defineSkeleton,
    defineVirtualRenderer,
    defineScrollView,
    defineTree,
    defineTreeItem,
  };
  // first define those already exist in the document for SSR
  discover(document.body, (comp) => {
    // @ts-ignore
    comps[`define${capitalize(camelize(comp))}`]?.();
  });
  Object.values(comps).forEach((d) => d());
}

export const __internal_defineSubscriber: ((componentName: string) => void)[] = [];
const discover = (root: Element, defineFn?: (componentName: string) => void) => {
  const { namespace, defaultProps } = GlobalStaticConfig;
  const rootTagName = root.tagName.toLowerCase();
  const prefix = namespace + '-';
  const componentsToRegister = new Set<string>();
  const reg = new RegExp(`^${prefix}`);
  if (rootTagName.startsWith(prefix) && !(supportCustomElement as CustomElementRegistry).get(rootTagName)) {
    componentsToRegister.add(rootTagName.replace(reg, ''));
  }
  root.querySelectorAll(':not(:defined)').forEach((el) => {
    const name = el.tagName.toLowerCase().replace(reg, '');
    if (name in defaultProps) componentsToRegister.add(name);
  });

  componentsToRegister.forEach((componentName) => {
    __internal_defineSubscriber.forEach((f) => f(componentName));
    defineFn
      ? defineFn(componentName)
      : import(`./${componentName}/${componentName}.define.ts`).catch(() => {
          // some components may not have define.ts file, like radio-group
        });
  });
};
export const autoDefine = once(() => {
  if (!supportCustomElement) return;
  const undefinedSet = new Set();
  components.forEach((comp) => {
    const tagName = GlobalStaticConfig.namespace + '-' + comp;
    if (!(supportCustomElement as CustomElementRegistry).get(tagName)) {
      undefinedSet.add(comp);
      (supportCustomElement as CustomElementRegistry).whenDefined(tagName).then(() => {
        undefinedSet.delete(comp);
        if (!undefinedSet.size) {
          observer.disconnect();
        }
      });
    }
  });

  const observer = new MutationObserver((mutations) => {
    for (const { addedNodes } of mutations) {
      for (const node of addedNodes) {
        if (isElement(node)) {
          discover(node);
        }
      }
    }
  });
  observer.observe(getDocumentElement(), { subtree: true, childList: true });
  discover(document.body);
});

export * from './accordion';
export * from './button';
export * from './calendar';
export * from './callout';
export * from './checkbox';
export * from './color-picker';
export * from './config';
export * from './custom-renderer';
export * from './date-picker';
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
export * from './scroll-view';
export * from './select';
export * from './skeleton';
export * from './spin';
export * from './switch';
export * from './table';
export * from './tabs';
export * from './tag';
export * from './teleport-holder';
export * from './text';
export * from './textarea';
export * from './theme-provider';
export * from './tooltip';
export * from './tour';
export * from './tree';
export * from './virtual-renderer';
export * from './watermark';
