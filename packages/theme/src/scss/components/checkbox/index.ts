import { createImportStyle } from "@lun/components";
import basic from './basic.scss?inline';
import soft from './soft.scss?inline';
import surface from './surface.scss?inline';

export const importCheckboxBasicTheme = createImportStyle('checkbox', basic);
export const importCheckboxSoftTheme = createImportStyle('checkbox', soft);
export const importCheckboxSurfaceTheme = createImportStyle('checkbox', surface);