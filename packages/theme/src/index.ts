import { GlobalStaticConfig, processStringStyle } from '@lun/components';
import element from './scss/common/index.scss?inline';

export * from './scss/components';

const createCommonImport = (style: string) => {
  return () => {
    GlobalStaticConfig.styles.common.push(processStringStyle(style));
  };
};

export const importCommonStyle = createCommonImport(element);
