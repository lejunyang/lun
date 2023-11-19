import { importButtonBasicTheme, importButtonSurfaceTheme } from './button/index.ts';
import { importInputBasicTheme, importInputSurfaceTheme } from './input/index.ts';
import { importSwitchBasicTheme } from './switch/index.ts';
import { importTagBasicTheme, importTagSurfaceTheme } from './tag/index.ts';

export * from './input/index.ts';

export function importBasicTheme() {
  importButtonBasicTheme();
  importInputBasicTheme();
  importSwitchBasicTheme();
  importTagBasicTheme();
}

export function importSurfaceTheme() {
  importButtonSurfaceTheme();
  importInputSurfaceTheme();
  importTagSurfaceTheme();
}
