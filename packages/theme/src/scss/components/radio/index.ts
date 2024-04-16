import { createImportStyle } from '@lun/components';
import basic from './basic.scss?inline';
import surface from './surface.scss?inline';

export const importRadioBasicTheme = createImportStyle('radio', basic);
export const importRadioSurfaceTheme = createImportStyle('radio', surface);
