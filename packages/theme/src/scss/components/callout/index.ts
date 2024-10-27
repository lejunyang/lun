import { createImportStyle } from '@lun-web/components';
import basic from './basic.scss?inline';
import outline from './outline.scss?inline';
import soft from './soft.scss?inline';
import surface from './surface.scss?inline';

export const importCalloutBasicTheme = createImportStyle('callout', basic);
export const importCalloutSurfaceTheme = createImportStyle('callout', surface, 'surface');
export const importCalloutSoftTheme = createImportStyle('callout', soft, 'soft');
export const importCalloutOutlineTheme = createImportStyle('callout', outline, 'outline');
