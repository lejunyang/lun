import { isFunction } from '@lun/utils';
import { warn } from 'utils';
import { getCurrentInstance, onMounted, shallowReactive } from 'vue';

export function useShadowDom<CE extends HTMLElement = HTMLElement, RootEl extends HTMLElement = HTMLElement>(
  onMountCB?: (state: { rootEl: RootEl; shadowRoot: ShadowRoot; CE: CE }) => void
) {
  const instance = getCurrentInstance();
  const state = shallowReactive({
    /** root Element of shadow dom */
    rootEl: undefined as RootEl | undefined,
    shadowRoot: undefined as ShadowRoot | undefined,
    /** Custom Element itself */
    CE: undefined as CE | undefined,
  });
  /** el of vnode is not null only after onMounted */
  onMounted(() => {
    state.rootEl = instance?.vnode.el as RootEl;
    state.shadowRoot = state.rootEl?.parentNode as ShadowRoot;
    state.CE = state.shadowRoot?.host as CE;
    if (state.CE && isFunction(onMountCB)) onMountCB(state as any);
  });
  return state;
}

/**
 * expose something to Custom Element
 */
export function useCEExpose(expose: Record<string | symbol, any>) {
  const instance = getCurrentInstance();
  onMounted(() => {
    const rootEl = instance?.vnode.el as HTMLElement;
    const CE = (rootEl?.parentNode as ShadowRoot)?.host;
    if (CE) {
      if (__DEV__) {
        const existKeys = Object.keys(expose).filter(
          (k) => Object.prototype.hasOwnProperty.call(expose, k) && (CE as any)[k]
        );
        if (existKeys.length) warn(`keys '${existKeys}' are existed on`, CE, 'their values will be override');
      }
      Object.assign(CE, expose);
    }
  });
}
