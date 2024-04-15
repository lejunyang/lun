import { GlobalStaticConfig } from 'config';
import { inBrowser, isObject, objectKeys } from '@lun/utils';
import { ComputedRef, computed, reactive } from 'vue';

export type Breakpoints = 'initial' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Responsive<T> = T | Partial<Record<Breakpoints, T>>;

type B = (typeof GlobalStaticConfig)['breakpoints'];
type BK = keyof B;

let medias: Record<BK, MediaQueryList>;
const breakpointStates = reactive({} as Record<BK, boolean>);

export const activeBreakpoint = computed(() => {
  return objectKeys(breakpointStates).find(
    (k, index, keys) => breakpointStates[k] && !breakpointStates[keys[index + 1]],
  );
});

export function useBreakpoint<
  P extends Record<string, Responsive<any>>,
  K extends keyof P = 'size',
  V = P[K] extends Responsive<infer T> ? T : P[K],
  Trans extends (v: V) => any = (v: V) => V,
>(props: P, k?: K, transform?: Trans): ComputedRef<ReturnType<Trans>> {
  if (!medias && inBrowser) {
    medias = {} as any;
    const { breakpoints } = GlobalStaticConfig;
    objectKeys(breakpoints).forEach((key) => {
      const minWidth = breakpoints[key];
      const media = matchMedia(`(min-width: ${minWidth})`);
      media.onchange = () => {
        breakpointStates[key] = media.matches;
      };
      breakpointStates[key] = media.matches;
      medias[key] = media;
    });
  }
  transform ||= ((v: V) => v) as Trans;
  return computed(() => {
    const value = props[k || 'size'];
    if (isObject(value)) {
      // find the largest active breakpoint
      const key = objectKeys(breakpointStates).find(
        (k, index, keys) => value[k] && breakpointStates[k] && !breakpointStates[keys[index + 1]],
      );
      return transform(key ? value[key] : value.initial || value);
    }
    return transform(value);
  }) as any;
}
