import { createImportStyle } from '@lun/components';
import basic from './basic.scss?inline';
import surface from './surface.scss?inline';

export const importRangeBasicTheme = createImportStyle('range', basic);
export const importRangeSurfaceTheme = createImportStyle('range', surface, 'surface');
