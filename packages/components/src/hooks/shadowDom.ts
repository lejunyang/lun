import { useSetupEdit } from '@lun/core';
import { isFunction, isHTMLElement, pick } from '@lun/utils';
import { warn } from 'utils';
import {
  ComputedRef,
  MaybeRef,
  camelize,
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  readonly,
  shallowReactive,
  unref,
  watchEffect,
} from 'vue';
import { useNamespace } from './useNameSpace';
import { GlobalStaticConfig } from '../components/config/config.static';

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
  onBeforeUnmount(() => {
    state.rootChildNode = undefined;
    state.shadowRoot = undefined;
    state.CE = undefined;
  });
  return readonly(state) as Readonly<typeof state>;
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

let mustAddPrefixForCustomState: boolean | null = null; // in chromium 90~X, need to add '--' prefix for custom state or it will throw an error
/**
 * update custom element's states automatically.
 * this depends on the ElementInternals property '_internals'.
 * if no CustomStateSet, expose states to dataset.
 * @param states
 * @returns computed state class of root element
 */
export function useCEStates<T extends Record<string, MaybeRef> | null | undefined>(
  statesGetter: () => T,
  ns?: ReturnType<typeof useNamespace>,
  editComputed?: ReturnType<typeof useSetupEdit>[0],
) {
  let stop: ReturnType<typeof watchEffect>;
  const states = computed(() => ({
    ...statesGetter(),
    ...(editComputed?.value &&
      pick(editComputed.value, ['disabled', 'editable', 'interactive', 'loading', 'readonly'])),
  }));
  onCEMount(({ CE }) => {
    const stateSet = (CE as any)._internals?.states as Set<string>;
    const { reflectStateToAttr } = GlobalStaticConfig;
    const setAttr = reflectStateToAttr === 'always' || (reflectStateToAttr === 'auto' && !stateSet);
    stop = watchEffect(() => {
      for (let [k, v] of Object.entries(states.value)) {
        v = unref(v);
        if (stateSet) {
          if (v) {
            if (mustAddPrefixForCustomState === null) {
              try {
                stateSet.add(k);
                mustAddPrefixForCustomState = false;
              } catch {
                mustAddPrefixForCustomState = true;
              }
            } else if (!mustAddPrefixForCustomState) stateSet.add(k);
            stateSet.add('--' + k); // always add prefix for chromium
          } else {
            stateSet.delete('--' + k);
            stateSet.delete(k);
          }
        }
        if (setAttr) {
          k = camelize(k); // must, because dataset only accepts camelCase
          if (v) CE.dataset[k] = '';
          else delete CE.dataset[k];
        }
      }
    });
  });
  onBeforeUnmount(() => stop?.());
  return [
    computed(() => (ns ? [ns.t, ns.is(states.value)] : '')),
    states as ComputedRef<
      T & {
        disabled?: boolean | undefined;
        readonly?: boolean | undefined;
        loading?: boolean | undefined;
        editable?: boolean | undefined;
        interactive?: boolean | undefined;
      }
    >,
  ] as const;
}
