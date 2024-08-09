import { createImportStyle  } from '@lun/components';
import basic from './basic.scss?inline';
import surface from './surface.scss?inline';

export const importTextareaBasicTheme = createImportStyle('textarea', basic);
export const importTextareaSurfaceTheme = createImportStyle('textarea', surface, 'surface');
