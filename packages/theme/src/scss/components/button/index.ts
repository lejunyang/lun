import { createImportStyle } from "@lun/components";
import basic from './basic.scss?inline';
import outline from './outline.scss?inline';
import soft from './soft.scss?inline';
import solid from './solid.scss?inline';
import surface from './surface.scss?inline';

export const importButtonBasicTheme = createImportStyle('button', basic);
export const importButtonOutlineTheme = createImportStyle('button', outline);
export const importButtonSoftTheme = createImportStyle('button', soft);
export const importButtonSolidTheme = createImportStyle('button', solid);
export const importButtonSurfaceTheme = createImportStyle('button', surface);