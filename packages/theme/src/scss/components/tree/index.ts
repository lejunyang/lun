import { createImportStyle } from '@lun-web/components';
import basic from './basic.scss?inline';
import common from './tree-common';

const importBasic = createImportStyle('tree', basic),
  importCommon = createImportStyle('tree', common);
export const importTreeBasicTheme = () => {
  importBasic();
  importCommon();
};
