import { createUnrefCalls, objectComputed, unrefOrGetState, useEdit } from '@lun-web/core';
import { createBinds, fromObject, hyphenate, objectKeys, pick, runIfFn } from '@lun-web/utils';
import {
  MaybeRef,
  Ref,
  camelize,
  computed,
  getCurrentInstance,
  isRef,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  watchEffect,
} from 'vue';
import { useDefinedNameSpace } from './useNameSpace';
import { GlobalStaticConfig } from '../components/config/config.static';
import type { VueElement } from 'custom';

/** get current host custom element */
export const useCE = () => getCurrentInstance()!.ce! as VueElement;

/**
 * expose something to Custom Element
 */
export function useCEExpose(expose: Record<string | symbol, any>, extraDescriptors?: PropertyDescriptorMap) {
  const CE = useCE();
  const keys = objectKeys(expose).concat(objectKeys(extraDescriptors || {}) as string[]);
  Object.defineProperties(CE, Object.getOwnPropertyDescriptors(expose));
  if (extraDescriptors) Object.defineProperties(CE, extraDescriptors);
  onUnmounted(() => {
    keys.forEach((k) => {
      delete CE[k as keyof typeof CE];
    });
  });
}

let mustAddPrefixForCustomState: boolean | undefined; // in chromium 90~125, must add '--' prefix for custom state or it will throw an error
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
>(statesGetter?: () => T) {
  let stop: ReturnType<typeof watchEffect>;
  const editComputed = useEdit()!;
  const ns = useDefinedNameSpace();
  const states = objectComputed(() => ({
    ...statesGetter?.(),
    ...pick(editComputed, ['disabled', 'editable', 'interactive', 'loading', 'readonly']),
  })) as any as S;
  const hyphenatedStates = objectComputed(() => fromObject(states, (k, v) => [hyphenate(k), v]));
  let lastStatesKey = new Set<string>();
  const CE = useCE();
  // must in mount, form-item need to be set on mount
  onMounted(() => {
    const stateSet = ((CE as any)._internals as ElementInternals | undefined)?.states;
    const { reflectStateToAttr, stateAttrType, statePrefix } = GlobalStaticConfig;
    let setAttr = reflectStateToAttr === 'always' || (reflectStateToAttr === 'auto' && !stateSet);

    const handleState = (k: string, v: any, addState = true) => {
      if (stateSet) {
        if (v && addState) {
          if (mustAddPrefixForCustomState === undefined) {
            try {
              stateSet.add(k);
              mustAddPrefixForCustomState = false;
            } catch {
              mustAddPrefixForCustomState = true;
              if (reflectStateToAttr === 'double-dash') setAttr = true;
            }
          } else if (!mustAddPrefixForCustomState) stateSet.add(k);
          stateSet.add('--' + k); // always add prefix for chromium because there are several versions that support both
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

type InterceptMethods = {
  click?: () => void;
  focus?: (options: FocusOptions) => void;
  blur?: () => void;
};
/** intercept custom element's click, focus and blur methods */
export function interceptCEMethods(
  methodsOrEl:
    | InterceptMethods
    | ((originalMethods: Required<InterceptMethods>) => InterceptMethods)
    | Ref<HTMLElement | undefined>,
) {
  const CE = useCE(),
    keys = ['focus', 'blur', 'click'] as ['focus', 'blur', 'click'],
    originalMethods = createBinds(CE, keys);
  Object.assign(
    CE,
    isRef(methodsOrEl) ? createUnrefCalls(methodsOrEl, ...keys) : runIfFn(methodsOrEl, originalMethods),
  );
  // recover intercepted methods before unmount to avoid duplicate change. because dom can disconnect and connect again, then it will setup again
  onBeforeUnmount(() => Object.assign(CE, originalMethods));
}
