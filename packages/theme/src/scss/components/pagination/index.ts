import { createImportStyle } from '@lun-web/components';
import basic from './basic.scss?inline';
import surface from './surface.scss?inline';

export const importPaginationBasicTheme = createImportStyle('pagination', basic);
export const importPaginationSurfaceTheme = createImportStyle('pagination', surface, 'surface');