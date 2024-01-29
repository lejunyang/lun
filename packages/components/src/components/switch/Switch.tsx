import { defineSSRCustomElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { createDefineElement, renderElement } from 'utils';
import { useCheckedModel, useNamespace, useSetupContextEvent } from 'hooks';
import { switchEmits, switchProps } from './type';
import { defineSpin } from '../spin/Spin';

const name = 'switch';
export const Switch = defineSSRCustomElement({
  name,
  props: switchProps,
  emits: switchEmits,
  setup(props) {
    const ns = useNamespace(name);
    useSetupContextEvent();
    const checkedModel = useCheckedModel(props);
    const [editComputed] = useSetupEdit();

    const inputHandlers = {
      onChange(e: Event) {
        const { checked } = e.target as HTMLInputElement;
        checkedModel.value = checked;
      },
    };

    return () => {
      const checked = checkedModel.value;
      const { spinProps, trueText, falseText } = props;
      const { readonly, disabled, loading } = editComputed.value;
      return (
        <>
          <label part={ns.p('root')} class={[...ns.s(editComputed), ns.is('checked', checked)]}>
            <input
              part={ns.p('input')}
              type="checkbox"
              role="switch"
              checked={checked}
              aria-checked={checked}
              readonly={readonly}
              disabled={disabled}
              hidden
              {...inputHandlers}
            />
            <span part={ns.p('thumb')} class={[ns.e('thumb')]}>
              <slot name={loading ? 'loading' : 'thumb'}>{loading && renderElement('spin', spinProps)}</slot>
            </span>
            <span part={ns.p('children')} class={ns.e('children')}>
              <span v-show={checked} class={ns.e('checked')}>
                <slot name="checked">{trueText}</slot>
              </span>
              <span v-show={!checked} class={ns.e('unchecked')}>
                <slot name="unchecked">{falseText}</slot>
              </span>
            </span>
          </label>
        </>
      );
    };
  },
});

export type tSwitch = typeof Switch;

export const defineSwitch = createDefineElement(name, Switch, {
  spin: defineSpin,
});
