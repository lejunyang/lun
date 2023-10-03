import { GlobalStaticConfig } from '@lun/components';
import { processStringStyle } from './utils';
import element from './scss/common/index.scss?inline';

export * from './scss/components';

export function importCommonStyle() {
  GlobalStaticConfig.styles.common.push(processStringStyle(element));
}