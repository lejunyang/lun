import { defineSSRCustomFormElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { createDefineElement, renderElement } from 'utils';
import { useCheckedModel, useNamespace, useSetupContextEvent } from 'hooks';
import { switchProps } from './type';
import { defineSpin } from '../spin/Spin';

const name = 'switch';
export const Switch = defineSSRCustomFormElement({
  name,
  props: switchProps,
  emits: ['update'],
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
          <label
            part="root"
            class={[ns.b(), ns.is('checked', checked), ns.is('loading', loading), ns.is('disabled', disabled)]}
          >
            <input
              part="input"
              type="checkbox"
              role="switch"
              checked={checked}
              aria-checked={checked}
              readonly={readonly}
              disabled={disabled}
              hidden
              {...inputHandlers}
            />
            <span part="wrapper" class={ns.e('wrapper')}>
              {checked && <slot name="checked">{trueText}</slot>}
              <span part="thumb" class={[ns.e('thumb')]}>
                {loading && <slot name="loading">{renderElement('spin', spinProps)}</slot>}
              </span>
              {!checked && <slot name="unchecked">{falseText}</slot>}
            </span>
          </label>
        </>
      );
    };
  },
});

declare module 'vue' {
  export interface GlobalComponents {
    LSwitch: typeof Switch;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-switch': typeof Switch;
  }
}

export const defineSwitch = createDefineElement(name, Switch, {
  spin: defineSpin,
});
