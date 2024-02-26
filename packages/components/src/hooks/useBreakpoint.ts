import { GlobalStaticConfig } from 'config';
import { inBrowser, isObject, objectKeys } from '@lun/utils';
import { ComputedRef, computed, reactive } from 'vue';

export type Breakpoints = 'initial' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Responsive<T> = T | Partial<Record<Breakpoints, T>>;

type B = (typeof GlobalStaticConfig)['breakpoints'];
type BK = keyof B;

let medias: Record<BK, MediaQueryList>;
const breakpointStates = reactive({} as Record<BK, boolean>);

export function useBreakpoint<P extends Record<string, Responsive<any>>, K extends keyof P = 'size'>(
  props: P,
  k?: K,
): P[K] extends Responsive<infer T> ? ComputedRef<T> : ComputedRef<P[K]> {
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
  return computed(() => {
    const value = props[k || 'size'];
    if (isObject(value)) {
      // find the largest active breakpoint
      const key = objectKeys(breakpointStates).find(
        (k, index, keys) => value[k] && breakpointStates[k] && !value[keys[index + 1]],
      );
      return key ? value[key] : value.initial || value;
    }
    return value;
  }) as any;
}
