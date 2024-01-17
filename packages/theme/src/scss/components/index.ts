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

export * from './input/index.ts';

export function importBasicTheme() {
  importButtonBasicTheme();
  importCheckboxBasicTheme();
  importCheckboxGroupBasicTheme();
  importDialogBasicTheme();
  importDividerBasicTheme();
  importFormBasicTheme();
  importFormItemBasicTheme();
  importInputBasicTheme();
  importPopoverBasicTheme();
  importRadioBasicTheme();
  importSelectBasicTheme();
  importSelectOptgroupBasicTheme();
  importSelectOptionBasicTheme();
  importSwitchBasicTheme();
  importTagBasicTheme();
}

export function importOutlineTheme() {
  importButtonOutlineTheme();
  importTagOutlineTheme();
}

export function importSoftTheme() {
  importButtonSoftTheme();
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
  importCheckboxSurfaceTheme();
  importInputSurfaceTheme();
  importSwitchSurfaceTheme();
  importTagSurfaceTheme();
}
