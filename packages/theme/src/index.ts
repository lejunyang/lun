import { GlobalStaticConfig } from '@lun/components';
import { processStringStyle } from './utils';
import element from './scss/common/index.scss?inline';

export function importCommonStyle(useCssStyleSheet?: boolean) {
  GlobalStaticConfig.styles.common.push(processStringStyle(element, useCssStyleSheet));
}