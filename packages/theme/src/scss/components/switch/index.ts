import { createImportStyle } from '@lun-web/components';
import basic from './basic.scss?inline';
import surface from './surface.scss?inline';

export const importSwitchBasicTheme = createImportStyle('switch', basic);
export const importSwitchSurfaceTheme = createImportStyle('switch', surface);