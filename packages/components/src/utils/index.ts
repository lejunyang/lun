import { MaybeRefLikeOrGetter, unrefOrGet } from '@lun/core';
import { createVirtualMerge, toGetterDescriptors } from '@lun/utils';

export * from './alias';
export * from './component';
export * from './console';
export * from './style';
export * from './vueUtils';

export function toUnrefGetterDescriptors<
  M extends MaybeRefLikeOrGetter<{}>,
  T = M extends MaybeRefLikeOrGetter<infer V> ? V : any,
  K extends keyof T = keyof T,
  PM extends Partial<Record<K, string>> = Partial<Record<K, string>>,
>(obj: M, propertiesMap: PM): Record<PM[keyof PM] & {}, PropertyDescriptor> {
  // @ts-ignore
  return toGetterDescriptors(propertiesMap, propertiesMap, (_, k) => unrefOrGet(obj)?.[k]);
}

export const virtualUnrefGetMerge = createVirtualMerge<true>(
  () => ({
    set() {
      return false;
    },
  }),
  (t) => unrefOrGet(t),
);
