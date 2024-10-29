import { objectComputed, unrefOrGetState, useEdit } from '@lun-web/core';
import { fromObject, hyphenate, pick } from '@lun-web/utils';
import { MaybeRef, camelize, computed, getCurrentInstance, onBeforeUnmount, onMounted, watchEffect } from 'vue';
import { useNamespace } from './useNameSpace';
import { GlobalStaticConfig } from '../components/config/config.static';
import { VueElement } from 'custom';

/** get current host custom element */
export const useCE = () => getCurrentInstance()!.ce! as VueElement;

/**
 * expose something to Custom Element
 */
export function useCEExpose(expose: Record<string | symbol, any>, extraDescriptors?: PropertyDescriptorMap) {
  const CE = useCE();
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
>(statesGetter?: () => T, ns?: ReturnType<typeof useNamespace>) {
  let stop: ReturnType<typeof watchEffect>;
  const editComputed = useEdit();
  const states = objectComputed(() => ({
    ...statesGetter?.(),
    ...pick(editComputed, ['disabled', 'editable', 'interactive', 'loading', 'readonly']),
  })) as any as S;
  const hyphenatedStates = objectComputed(() => fromObject(states, (k, v) => [hyphenate(k), v]));
  let lastStatesKey = new Set<string>();
  const CE = useCE();
  // must in mount, form-item need to be set on mount
  onMounted(() => {
    const stateSet = (CE as any)._internals?.states as Set<string>;
    const { reflectStateToAttr, stateAttrType, statePrefix } = GlobalStaticConfig;
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
        if (stateAttrType === 'dataset') {
          if (v) CE.dataset[camelK] = '';
          else delete CE.dataset[camelK];
        } else if (stateAttrType === 'class') {
          if (v) CE.classList.add(statePrefix + k);
          else CE.classList.remove(statePrefix + k);
        }
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

/** auto update custom element's default aria attributes */
export function useAria(
  ariaGetter: () => Partial<
    Omit<
      ElementInternals,
      'states' | 'shadowRoot' | 'form' | 'labels' | 'willValidate' | 'validity' | 'validationMessage'
    >
  >,
) {
  const CE = useCE();
  watchEffect(() => {
    const aria = ariaGetter();
    aria && Object.assign((CE as any as { _internals: ElementInternals })._internals, aria);
  });
}
