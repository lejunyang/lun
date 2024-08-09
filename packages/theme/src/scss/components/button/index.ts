import { createImportStyle } from '@lun/components';
import basic from './basic.scss?inline';
import outline from './outline.scss?inline';
import soft from './soft.scss?inline';
import solid from './solid.scss?inline';
import surface from './surface.scss?inline';
import ghost from './ghost.scss?inline';

export const importButtonBasicTheme = createImportStyle('button', basic);
export const importButtonSurfaceTheme = createImportStyle('button', surface, 'surface');
export const importButtonSoftTheme = createImportStyle('button', soft, 'soft');
export const importButtonOutlineTheme = createImportStyle('button', outline, 'outline');
export const importButtonSolidTheme = createImportStyle('button', solid, 'solid');
export const importButtonGhostTheme = createImportStyle('button', ghost, 'ghost');