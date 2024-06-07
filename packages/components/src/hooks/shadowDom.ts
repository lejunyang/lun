import { refToGetter, unrefOrGetState, useEdit } from '@lun/core';
import { fromObject, hyphenate, isFunction, isHTMLElement, pick } from '@lun/utils';
import { warn } from 'utils';
import {
  MaybeRef,
  camelize,
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  readonly,
  shallowReactive,
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
  onUnmounted(() => {
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
  const { CE } = getCurrentInstance()!;
  Object.defineProperties(CE, Object.getOwnPropertyDescriptors(expose));
  if (extraDescriptors) Object.defineProperties(CE, extraDescriptors);
}

let mustAddPrefixForCustomState: boolean | null = null; // in chromium 90~X, need to add '--' prefix for custom state or it will throw an error
/**
 * update custom element's states automatically.
 * this depends on the ElementInternals property '_internals'.
 * if no CustomStateSet, expose states to dataset.
 * @param states {() => Record<string, MaybeRef | MaybeRef[]>} key needs to be camelCase
 * @returns computed state class of root element
 */
export function useCEStates<
  T extends Record<string, MaybeRef> | null | undefined,
  S extends Record<string, any> = T & {
    disabled?: boolean | undefined;
    readonly?: boolean | undefined;
    loading?: boolean | undefined;
    editable?: boolean | undefined;
    interactive?: boolean | undefined;
  },
>(statesGetter: () => T, ns?: ReturnType<typeof useNamespace>) {
  let stop: ReturnType<typeof watchEffect>;
  const editComputed = useEdit();
  const states = refToGetter(
    computed(() => ({
      ...statesGetter(),
      ...pick(editComputed, ['disabled', 'editable', 'interactive', 'loading', 'readonly']),
    })),
  ) as any as S;
  const hyphenatedStates = refToGetter(computed(() => fromObject(states, (k, v) => [hyphenate(k), v])));
  let lastStatesKey = new Set<string>();
  // must in mount, form-item need to be set on mount
  onCEMount(({ CE }) => {
    const stateSet = (CE as any)._internals?.states as Set<string>;
    const { reflectStateToAttr } = GlobalStaticConfig;
    const setAttr = reflectStateToAttr === 'always' || (reflectStateToAttr === 'auto' && !stateSet);

    const handleState = (k: string, v: any, addState = true) => {
      if (stateSet) {
        if (v && addState) {
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
      const camelK = camelize(k); // dataset only accepts camelCase
      if (setAttr) {
        if (v) CE.dataset[camelK] = '';
        delete CE.dataset[camelK];
      }
    };

    stop = watchEffect(() => {
      const newStatesKey = new Set<string>();
      for (const [k, v] of Object.entries(hyphenatedStates)) {
        lastStatesKey.delete(k);
        newStatesKey.add(k);
        handleState(k, unrefOrGetState(v));
      }
      for (const k of lastStatesKey) {
        handleState(k, false, false);
      }

      lastStatesKey = newStatesKey;
    });
  });
  onBeforeUnmount(() => stop?.());
  return [computed(() => (ns ? [ns.t, ns.is(hyphenatedStates)] : '')), states] as const;
}
