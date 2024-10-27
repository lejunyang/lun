import { createImportStyle } from "@lun-web/components";
import basic from './basic.scss?inline';
import soft from './soft.scss?inline';
import surface from './surface.scss?inline';

// TODO change card into a variant
export const importCheckboxBasicTheme = createImportStyle('checkbox', basic);
export const importCheckboxSurfaceTheme = createImportStyle('checkbox', surface, 'surface');
export const importCheckboxSoftTheme = createImportStyle('checkbox', soft, 'soft');
