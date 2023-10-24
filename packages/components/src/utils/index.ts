import { MaybeRefLikeOrGetter, unrefOrGet } from '@lun/core';

export * from './component';
export * from './console';
export * from './style';
export * from './vueUtils';

export function toGetterDescriptors<
  M extends MaybeRefLikeOrGetter<{}>,
  T = M extends MaybeRefLikeOrGetter<infer V> ? V : any,
  K extends keyof T = keyof T,
  PM extends Partial<Record<K, string>> = Partial<Record<K, string>>
>(obj: M, propertiesMap: PM): Record<PM[keyof PM] & {}, PropertyDescriptor> {
  const descriptors = {} as any;
  for (const [key, value] of Object.entries(propertiesMap)) {
    descriptors[value as any] = {
      get() {
        return (unrefOrGet(obj) as any)?.[key];
      },
    };
  }
  return descriptors;
}
