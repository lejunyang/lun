import { importButtonBasicTheme, importButtonOutlineTheme, importButtonSoftTheme, importButtonSolidTheme, importButtonSurfaceTheme } from './button/index.ts';
import { importCheckboxBasicTheme, importCheckboxSoftTheme, importCheckboxSurfaceTheme } from './checkbox/index.ts';
import { importInputBasicTheme, importInputSurfaceTheme } from './input/index.ts';
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
  importInputBasicTheme();
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
