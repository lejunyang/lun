import { createImportStyle } from '@lun/components';
import basic from './basic.scss?inline';
import outline from './outline.scss?inline';
import soft from './soft.scss?inline';
import solid from './solid.scss?inline';
import surface from './surface.scss?inline';

export const importTagBasicTheme = createImportStyle('tag', basic);
export const importTagOutlineTheme = createImportStyle('tag', outline);
export const importTagSoftTheme = createImportStyle('tag', soft);
export const importTagSolidTheme = createImportStyle('tag', solid);
export const importTagSurfaceTheme = createImportStyle('tag', surface)