import { defineSSRCustomElement } from 'custom';
import { useSetupEdit, useSetupEvent } from '@lun-web/core';
import { createDefineElement, renderElement } from 'utils';
import { useCEStates, useCheckedModel, useNamespace } from 'hooks';
import { switchEmits, switchProps } from './type';
import { defineSpin } from '../spin/Spin';
import { Transition } from 'vue';
import { getCompParts } from 'common';

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
    const [editComputed] = useSetupEdit();

    const inputHandlers = {
      onChange(e: Event) {
        const { checked } = e.target as HTMLInputElement;
        checkedModel.value = checked;
      },
    };

    const [stateClass] = useCEStates(() => ({ checked: checkedModel.value }), ns);

    return () => {
      const checked = checkedModel.value;
      const { spinProps, trueText, falseText } = props;
      const { readonly, disabled, loading } = editComputed;
      return (
        <>
          <label part={compParts[0]} class={stateClass.value}>
            <input
              part={compParts[1]}
              type="checkbox"
              role="switch"
              checked={checked}
              aria-checked={checked}
              readonly={readonly}
              disabled={disabled}
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
export type iSwitch = InstanceType<tSwitch>;

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
