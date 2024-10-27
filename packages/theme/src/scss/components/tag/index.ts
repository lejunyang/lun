import { createImportStyle } from '@lun-web/components';
import basic from './basic.scss?inline';
import outline from './outline.scss?inline';
import soft from './soft.scss?inline';
import solid from './solid.scss?inline';
import surface from './surface.scss?inline';

export const importTagBasicTheme = createImportStyle('tag', basic);
export const importTagSurfaceTheme = createImportStyle('tag', surface, 'surface');
export const importTagOutlineTheme = createImportStyle('tag', outline, 'outline');
export const importTagSoftTheme = createImportStyle('tag', soft, 'soft');
export const importTagSolidTheme = createImportStyle('tag', solid, 'solid');
