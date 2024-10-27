import { createImportStyle  } from '@lun-web/components';
import basic from './basic.scss?inline';
import surface from './surface.scss?inline';

export const importMentionsBasicTheme = createImportStyle('mentions', basic);
export const importMentionsSurfaceTheme = createImportStyle('mentions', surface, 'surface');
