import { runIfFn } from '@lun/utils';
import { shallowReactive, ShallowReactive } from 'vue';

type RefValueType<V> = V extends new (...args: any[]) => infer Refer ? Refer : V;

export function useRefs<
  T extends Record<string, any>,
  R extends {
    [k in keyof T]: (val: RefValueType<T[k]> | null | undefined) => void;
  } = {
    [k in keyof T]: (val: RefValueType<T[k]> | null | undefined) => void;
  },
>(
  init: T,
  onRefCallback?: Partial<R>,
): {
  refs: ShallowReactive<{
    [k in keyof T]: RefValueType<T[k]> | null | undefined;
  }>;
  onRef: R;
} {
  const refs = shallowReactive(
    Object.keys(init).reduce((r, c) => {
      r[c] = null;
      return r;
    }, {} as Record<string, any>),
  );
  const onRefs = Object.keys(init).reduce((r, c) => {
    r[c] = (current: any) => {
      refs[c] = current;
      runIfFn<any>(onRefCallback?.[c], current);
    };
    return r;
  }, {} as Record<string, any>);
  return { refs, onRefs } as any;
}
