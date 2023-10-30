import { importButtonBasicTheme, importButtonSurfaceTheme } from './button/index.ts';
import { importInputSurfaceTheme } from './input/index.ts';

export * from './input/index.ts';

export function importBasicTheme() {
  importButtonBasicTheme()
}

export function importSurfaceTheme() {
  importButtonSurfaceTheme()
  importInputSurfaceTheme()
}