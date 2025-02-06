import { toGetterDescriptors, withResolvers, isFunction } from '@lun-web/utils';
import { MaybeRefLikeOrGetter, unrefOrGet } from './ref';
import { nextTick } from 'vue';

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

export function nextNTicks<T = void, R = void>(this: T, n: number, cb?: () => R) {
  const [promise, resolve] = withResolvers<R>();
  const countdown = () => {
    if (!--n || n < 0) {
      resolve(isFunction(cb) ? cb.call(this) : undefined!);
    } else nextTick(countdown);
  };
  nextTick(countdown);
  return promise;
}
