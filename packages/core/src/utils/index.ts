import { toGetterDescriptors } from '@lun/utils';
import { MaybeRefLikeOrGetter, unrefOrGet } from './ref';

export * from './ref';

export function toUnrefGetterDescriptors<
  M extends MaybeRefLikeOrGetter<{}>,
  T = M extends MaybeRefLikeOrGetter<infer V> ? V : any,
  K extends keyof T = keyof T,
  PM extends Partial<Record<K, string>> = Partial<Record<K, string>>,
>(obj: M, propertiesMap?: PM): Record<PM[keyof PM] & {}, PropertyDescriptor> {
  // @ts-ignore
  return toGetterDescriptors(obj, propertiesMap, (_, k) => unrefOrGet(obj[k]));
}
