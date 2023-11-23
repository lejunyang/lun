import { importButtonBasicTheme, importButtonSurfaceTheme } from './button/index.ts';
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
  importInputBasicTheme();
  importSwitchBasicTheme();
  importTagBasicTheme();
}

export function importOutlineTheme() {
  importTagOutlineTheme();
}

export function importSoftTheme() {
  importTagSoftTheme();
}

export function importSolidTheme() {
  importTagSolidTheme();
}

export function importSurfaceTheme() {
  importButtonSurfaceTheme();
  importInputSurfaceTheme();
  importSwitchSurfaceTheme();
  importTagSurfaceTheme();
}
