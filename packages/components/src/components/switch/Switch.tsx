import { defineSSRCustomElement } from 'custom';
import { useSetupEdit, useSetupEvent } from '@lun-web/core';
import { createDefineElement, renderElement } from 'utils';
import { interceptCEMethods, useCEStates, useCheckedModel, useNamespace } from 'hooks';
import { switchEmits, switchProps } from './type';
import { defineSpin } from '../spin/Spin';
import { ref, Transition } from 'vue';
import { getCompParts } from 'common';
import { isFunction, noop, promiseTry } from '@lun-web/utils';

const name = 'switch';
const parts = ['root', 'input', 'children', 'thumb', 'checked', 'unchecked'] as const;
const compParts = getCompParts(name, parts);
export const Switch = defineSSRCustomElement({
  name,
  props: switchProps,
  emits: switchEmits,
  formAssociated: true,
  setup(props) {
    const ns = useNamespace(name);
    useSetupEvent();
    const checkedModel = useCheckedModel(props);
    const [editComputed, editState] = useSetupEdit();
    const inputEl = ref<HTMLElement>();

    const inputHandlers = {
      onChange(e: Event) {
        const { checked } = e.target as HTMLInputElement;
        const { beforeUpdate } = props;
        if (isFunction(beforeUpdate)) {
          const prev = !!checkedModel.value;
          (e.target as HTMLInputElement).checked = prev;
          editState.loading = true;
          return promiseTry(beforeUpdate, prev)
            .then((res) => {
              if (res !== false) checkedModel.value = checked;
            })
            .catch(noop)
            .finally(() => (editState.loading = false));
        }
        checkedModel.value = checked;
      },
    };

    const [stateClass] = useCEStates(() => ({ checked: checkedModel.value }));
    interceptCEMethods(inputEl);

    return () => {
      const checked = checkedModel.value;
      const { spinProps, trueText, falseText } = props;
      const { readonly, editable, loading } = editComputed;
      return (
        <>
          <label part={compParts[0]} class={stateClass.value}>
            <input
              ref={inputEl}
              part={compParts[1]}
              type="checkbox"
              role="switch"
              checked={checked}
              aria-checked={checked}
              readonly={readonly}
              disabled={!editable}
              hidden
              {...inputHandlers}
            />
            <span part={compParts[3]} class={[ns.e('thumb')]}>
              <slot name={loading ? 'loading' : 'thumb'}>{loading && renderElement('spin', spinProps)}</slot>
            </span>
            <span part={compParts[2]} class={ns.e('children')}>
              <Transition name="children">
                <span v-show={checked} class={ns.e('checked')} part={compParts[4]}>
                  <slot name="checked">{trueText}</slot>
                </span>
              </Transition>
              <Transition name="children">
                <span v-show={!checked} class={ns.e('unchecked')} part={compParts[5]}>
                  <slot name="unchecked">{falseText}</slot>
                </span>
              </Transition>
            </span>
          </label>
        </>
      );
    };
  },
});

export type tSwitch = typeof Switch;
export type SwitchExpose = {};
export type iSwitch = InstanceType<tSwitch> & SwitchExpose;

export const defineSwitch = createDefineElement(
  name,
  Switch,
  {
    trueValue: true,
    falseValue: false,
  },
  parts,
  {
    spin: defineSpin,
  },
);
