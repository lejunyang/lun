import { unrefOrGet } from '@lun/core';
import { createVirtualMerge } from '@lun/utils';

export * from './alias';
export * from './component';
export * from './console';
export * from './style';
export * from './vueUtils';



export const virtualUnrefGetMerge = createVirtualMerge<true>(
  () => ({
    set() {
      return false;
    },
  }),
  (t) => unrefOrGet(t),
);
