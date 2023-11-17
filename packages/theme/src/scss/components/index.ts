import { importButtonBasicTheme, importButtonSurfaceTheme } from './button/index.ts';
import { importInputBasicTheme, importInputSurfaceTheme } from './input/index.ts';
import { importSwitchBasicTheme } from './switch/index.ts';

export * from './input/index.ts';

export function importBasicTheme() {
  importButtonBasicTheme();
  importInputBasicTheme();
  importSwitchBasicTheme();
}

export function importSurfaceTheme() {
  importButtonSurfaceTheme();
  importInputSurfaceTheme();
}
