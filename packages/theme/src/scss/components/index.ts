import {
  importButtonBasicTheme,
  importButtonOutlineTheme,
  importButtonSoftTheme,
  importButtonSolidTheme,
  importButtonSurfaceTheme,
} from './button/index.ts';
import { importCheckboxBasicTheme, importCheckboxSoftTheme, importCheckboxSurfaceTheme } from './checkbox/index.ts';
import { importDialogBasicTheme } from './dialog/index.ts';
import { importFormBasicTheme } from './form/index.ts';
import { importFormItemBasicTheme } from './form-item/index.ts';
import { importInputBasicTheme, importInputSoftTheme, importInputSurfaceTheme } from './input/index.ts';
import { importRadioBasicTheme } from './radio/index.ts';
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

export * from './input/index.ts';

export function importBasicTheme() {
  importButtonBasicTheme();
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
  importSelectBasicTheme();
  importSelectOptgroupBasicTheme();
  importSelectOptionBasicTheme();
  importSpinBasicTheme();
  importSwitchBasicTheme();
  importTagBasicTheme();
}

export function importOutlineTheme() {
  importButtonOutlineTheme();
  importCalloutOutlineTheme();
  importTagOutlineTheme();
}

export function importSoftTheme() {
  importButtonSoftTheme();
  importCalloutSoftTheme();
  importCheckboxSoftTheme();
  importInputSoftTheme();
  importTagSoftTheme();
}

export function importSolidTheme() {
  importButtonSolidTheme();
  importTagSolidTheme();
}

export function importSurfaceTheme() {
  importButtonSurfaceTheme();
  importCalloutSurfaceTheme();
  importCheckboxSurfaceTheme();
  importInputSurfaceTheme();
  importSwitchSurfaceTheme();
  importTagSurfaceTheme();
}
