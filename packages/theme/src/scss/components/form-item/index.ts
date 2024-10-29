import { createImportDynamicStyle, createImportStyle, isLunElement } from '@lun-web/components';
import basic from './basic.scss?inline';
import tooltip from './basic-tooltip.scss?inline';

export const importFormItemBasicTheme = () => {
  createImportStyle('form-item', basic)();
  createImportDynamicStyle('popover', (vm: any) => {
    // As form-item generates the tooltip vnode dynamically, we are not able to query those classes and apply styles in form or form-item's static css, must be in popover's style
    // so use dynamic style and only apply this style when popover and tooltip is under form
    const maybeForm = vm.parent?.parent;
    if (maybeForm && isLunElement(maybeForm.ce, 'form')) {
      return tooltip;
    }
  })();
};
