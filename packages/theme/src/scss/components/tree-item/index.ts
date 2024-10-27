import { createImportStyle } from '@lun-web/components';
import basic from './basic.scss?inline';
import common from '../tree/tree-common';

const importBasic = createImportStyle('tree-item', basic),
  importCommon = createImportStyle('tree-item', common);
export const importTreeItemBasicTheme = () => {
  importBasic();
  importCommon();
};
