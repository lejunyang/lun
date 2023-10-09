import { GlobalStaticConfig, processStringStyle } from '@lun/components';
import element from './scss/common/index.scss?inline';

export * from './scss/components';

export function importCommonStyle() {
  GlobalStaticConfig.styles.common.push(processStringStyle(element));
}