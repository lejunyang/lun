import { importInputSurfaceTheme } from './input/index.ts';

export * from './input/index.ts';
export * from './spin/index.ts';

export function importSurfaceTheme() {
  importInputSurfaceTheme()
}