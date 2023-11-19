import { createImportStyle } from '@lun/components';
import basic from './basic.scss?inline';
import surface from './surface.scss?inline';

export const importTagBasicTheme = createImportStyle('tag', basic);
export const importTagSurfaceTheme = createImportStyle('tag', surface)