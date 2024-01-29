import { isFunction, isHTMLElement } from '@lun/utils';
import { warn } from 'utils';
import { getCurrentInstance, onMounted, shallowReactive } from 'vue';

export function onCEMount(CB?: (state: { rootChildNode: Node; shadowRoot: ShadowRoot; CE: HTMLElement }) => void) {
  const vm = getCurrentInstance();
  if (!vm) return;
  onMounted(() => {
    const rootChildNode = vm?.proxy?.$el as Node;
    const root = rootChildNode?.parentNode as ShadowRoot;
    const CE = root?.host as HTMLElement;
    if (__DEV__ && !CE) {
      warn(`No custom element found in the current component instance`, vm);
    }
    if (isHTMLElement(CE) && isFunction(CB)) CB({ rootChildNode, shadowRoot: root, CE });
  });
}

export function useShadowDom<CE extends HTMLElement = HTMLElement, RootNode extends Node = HTMLElement>(
  onMountCB?: (state: { rootChildNode: RootNode; shadowRoot: ShadowRoot; CE: CE }) => void,
) {
  const state = shallowReactive({
    /** child Node of shadow root */
    rootChildNode: undefined as RootNode | undefined,
    shadowRoot: undefined as ShadowRoot | undefined,
    /** Custom Element itself */
    CE: undefined as CE | undefined,
  });
  onCEMount((s) => {
    Object.assign(state, s);
    if (isFunction(onMountCB)) onMountCB(s as any);
  });
  return state;
}

/**
 * expose something to Custom Element
 */
export function useCEExpose(expose: Record<string | symbol, any>, extraDescriptors?: PropertyDescriptorMap) {
  onCEMount(({ CE }) => {
    // if (__DEV__) {
    //   const existKeys = Object.keys(expose).filter(
    //     (k) => Object.prototype.hasOwnProperty.call(expose, k) && (CE as any)[k] != null
    //   );
    //   const existDescriptors =
    //     descriptors && Object.keys(descriptors).filter((d) => Object.getOwnPropertyDescriptor(CE, d));
    //   if (existKeys.length || existDescriptors?.length)
    //     warn(
    //       `keys '${existKeys.concat(existDescriptors || [])}' have already existed on`,
    //       CE,
    //       'their values will be override'
    //     );
    // }
    Object.defineProperties(CE, Object.getOwnPropertyDescriptors(expose));
    if (extraDescriptors) Object.defineProperties(CE, extraDescriptors);
  });
}
