import { createImportStyle } from '@lun-web/components';
import basic from './basic.scss?inline';
import solid from './solid.scss?inline';

export const importTabsBasicTheme = createImportStyle('tabs', basic);
export const importTabsSolidTheme = createImportStyle('tabs', solid, 'solid');
