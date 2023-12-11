import { importButtonBasicTheme, importButtonOutlineTheme, importButtonSoftTheme, importButtonSolidTheme, importButtonSurfaceTheme } from './button/index.ts';
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

export * from './input/index.ts';

export function importBasicTheme() {
  importButtonBasicTheme();
  importCheckboxBasicTheme();
  importDialogBasicTheme();
  importFormBasicTheme();
  importFormItemBasicTheme();
  importInputBasicTheme();
  importRadioBasicTheme();
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
