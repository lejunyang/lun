import { createImportStyle } from '@lun/components';
import basic from './index.scss?inline';
import surface from './surface.scss?inline';

export const importInputStyle = createImportStyle('input', basic);

export const importInputSurfaceTheme = createImportStyle('input', surface);
