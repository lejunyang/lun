import {
  importButtonBasicTheme,
  importButtonOutlineTheme,
  importButtonSoftTheme,
  importButtonSolidTheme,
  importButtonSurfaceTheme,
  importButtonGhostTheme,
} from './button/index.ts';
import { importCheckboxBasicTheme, importCheckboxSoftTheme, importCheckboxSurfaceTheme } from './checkbox/index.ts';
import { importDialogBasicTheme } from './dialog/index.ts';
import { importFormBasicTheme } from './form/index.ts';
import { importFormItemBasicTheme } from './form-item/index.ts';
import {
  importInputBasicTheme,
  importInputGhostTheme,
  importInputSoftTheme,
  importInputSurfaceTheme,
} from './input/index.ts';
import { importRadioBasicTheme, importRadioSurfaceTheme } from './radio/index.ts';
import { importSwitchBasicTheme, importSwitchSurfaceTheme } from './switch/index.ts';
import {
  importTagBasicTheme,
  importTagOutlineTheme,
  importTagSoftTheme,
  importTagSolidTheme,
  importTagSurfaceTheme,
} from './tag/index.ts';
import { importPopoverBasicTheme } from './popover/index.ts';
import { importSelectBasicTheme } from './select/index.ts';
import { importSelectOptionBasicTheme } from './select-option/index.ts';
import { importSelectOptgroupBasicTheme } from './select-optgroup/index.ts';
import { importDividerBasicTheme } from './divider/index.ts';
import { importCheckboxGroupBasicTheme } from './checkbox-group/index.ts';
import {
  importCalloutBasicTheme,
  importCalloutOutlineTheme,
  importCalloutSoftTheme,
  importCalloutSurfaceTheme,
} from './callout/index.ts';
import { importMessageBasicTheme } from './message/index.ts';
import { importSpinBasicTheme } from './spin/index.ts';
import { importProgressBasicTheme } from './progress/index.ts';
import { importTextareaBasicTheme, importTextareaSurfaceTheme } from './textarea/index.ts';
import { __internal_defineSubscriber } from '@lun/components';
import { once } from '@lun/utils';
import { importMentionsBasicTheme, importMentionsSurfaceTheme } from './mentions/index.ts';
import { importRadioGroupBasicTheme } from './radio-group/index.ts';
import { importThemeProviderBasicTheme } from './theme-provider/index.ts';
import { importIconBasicTheme } from './icon/index.ts';
import { importCommonTheme } from '../common/index.ts';
import { importRangeBasicTheme, importRangeSurfaceTheme } from './range';
import { importCalendarBasicTheme } from './calendar/index.ts';
import { importTourBasicTheme } from './tour/index.ts';

export * from './button';
export * from './calendar';
export * from './callout';
export * from './checkbox';
export * from './checkbox-group';
export * from './dialog';
export * from './divider';
export * from './form';
export * from './form-item';
export * from './input';
export * from './mentions';
export * from './message';
export * from './popover';
export * from './progress';
export * from './radio';
export * from './range';
export * from './select';
export * from './select-optgroup';
export * from './select-option';
export * from './spin';
export * from './switch';
export * from './tag';
export * from './textarea';
export * from './theme-provider';
export * from './tour';

export const importBasicTheme = once(() => {
  importThemeProviderBasicTheme();
  importButtonBasicTheme();
  importIconBasicTheme();
  importCalloutBasicTheme();
  importCheckboxBasicTheme();
  importCheckboxGroupBasicTheme();
  importDialogBasicTheme();
  importDividerBasicTheme();
  importFormBasicTheme();
  importFormItemBasicTheme();
  importInputBasicTheme();
  importMessageBasicTheme();
  importPopoverBasicTheme();
  importProgressBasicTheme();
  importRadioBasicTheme();
  importRadioGroupBasicTheme();
  importRangeBasicTheme();
  importSelectBasicTheme();
  importSelectOptgroupBasicTheme();
  importSelectOptionBasicTheme();
  importSpinBasicTheme();
  importSwitchBasicTheme();
  importTagBasicTheme();
  importTextareaBasicTheme();
  importMentionsBasicTheme();
  importCalendarBasicTheme();
  importTourBasicTheme();
});

export const importOutlineTheme = once(() => {
  importButtonOutlineTheme();
  importCalloutOutlineTheme();
  importTagOutlineTheme();
});

export const importSoftTheme = once(() => {
  importButtonSoftTheme();
  importCalloutSoftTheme();
  importCheckboxSoftTheme();
  importInputSoftTheme();
  importTagSoftTheme();
});

export const importSolidTheme = once(() => {
  importButtonSolidTheme();
  importTagSolidTheme();
});

export const importSurfaceTheme = once(() => {
  importButtonSurfaceTheme();
  importCalloutSurfaceTheme();
  importCheckboxSurfaceTheme();
  importInputSurfaceTheme();
  importSwitchSurfaceTheme();
  importTagSurfaceTheme();
  importTextareaSurfaceTheme();
  importMentionsSurfaceTheme();
  importRadioSurfaceTheme();
  importRangeSurfaceTheme();
});

export const importGhostTheme = once(() => {
  importButtonGhostTheme();
  importInputGhostTheme();
});

export const autoImportTheme = once(() => {
  importCommonTheme();
  __internal_defineSubscriber.push((comp) => {
    import(`./${comp}/index.ts`)
      .then((m) => {
        Object.values(m).forEach((f: any) => f());
      })
      .catch(() => {
        // not every comp has theme, need to ignore the error
      });
  });
});
