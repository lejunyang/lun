import { createImportStyle } from "@lun/components";
import basic from './basic.scss?inline';
import surface from './surface.scss?inline';

export const importButtonBasicTheme = createImportStyle('button', basic);
export const importButtonSurfaceTheme = createImportStyle('button', surface);