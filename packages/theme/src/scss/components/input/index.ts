import { createImportStyle } from '@lun/components';
import basic from './basic.scss?inline';
import surface from './surface.scss?inline';
import soft from './soft.scss?inline';
import ghost from './ghost.scss?inline';

export const importInputBasicTheme = createImportStyle('input', basic);
export const importInputSurfaceTheme = createImportStyle('input', surface, 'surface');
export const importInputSoftTheme = createImportStyle('input', soft, 'soft');
export const importInputGhostTheme = createImportStyle('input', ghost, 'ghost');
