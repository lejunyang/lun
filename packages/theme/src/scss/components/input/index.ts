import { createImportStyle } from '@lun/components';
import basic from './basic.scss?inline';
import surface from './surface.scss?inline';
import soft from './soft.scss?inline';

export const importInputBasicTheme = createImportStyle('input', basic);
export const importInputSoftTheme = createImportStyle('input', soft);
export const importInputSurfaceTheme = createImportStyle('input', surface);
