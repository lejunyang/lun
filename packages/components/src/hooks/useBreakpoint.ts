import { GlobalStaticConfig } from '@/components';
import { Responsive } from '@lun/core';
import { isObject } from '@lun/utils';
import { computed, ref } from 'vue';

let medias: Record<keyof (typeof GlobalStaticConfig)['breakpoints'], MediaQueryList>;
const activeBreakpoint = ref<keyof (typeof GlobalStaticConfig)['breakpoints']>();

export function useBreakpoints<P extends Record<string, Responsive<any>>, K extends keyof P>(props: P, k?: K) {
  if (!medias) {
    medias = {} as any;
    const { breakpoints } = GlobalStaticConfig;
    for (const k in breakpoints) {
      const key = k as keyof typeof breakpoints;
      const value = breakpoints[key];
      const media = window.matchMedia(`(min-width: ${value})`);
      media.onchange = () => {
        if (media.matches) {
          // TODO test xs to xl
          activeBreakpoint.value = key;
        }
      };
      medias[key] = media;
    }
  }
  return computed(() => {
    const value = props[k || 'size'];
    return isObject(value) ? value[activeBreakpoint.value || 'initial'] || value : value;
  });
}
