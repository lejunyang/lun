import { defineSSRCustomElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { createDefineElement } from 'utils';
import { formItemProps } from './type';
import { useNamespace } from 'hooks';
import { FormItemCollector } from '../form';
import { ComponentInternalInstance } from 'vue';
import { FormInputCollector } from '.';

const name = 'form-item';
export const FormItem = defineSSRCustomElement({
  name,
  props: formItemProps,
  setup(props) {
    const ns = useNamespace(name);
    useSetupEdit();
    const formContext = FormItemCollector.child();

    const getIndex = (vm?: ComponentInternalInstance) => {
      if (!vm) return;
      const el = inputContext.childrenVmElMap.get(vm);
      return inputContext.childrenElIndexMap.get(el!);
    };
    const getValue = (vm?: ComponentInternalInstance) => {
      const { name, array } = props;
      if (!name || !formContext) return;
      const { getValue: getFormValue } = formContext;
      if (!array) return getFormValue(name);
      const index = getIndex(vm);
      if (index === undefined) return;
      return getFormValue(`${name}.${index}`);
    };
    const inputContext = FormInputCollector.parent({
      extraProvide: { getValue },
    });

    return () => {
      return (
        <>
          {props.label && (
            <div part="label" class={[ns.e('label')]}>
              {props.label}
            </div>
          )}
          <slot></slot>
        </>
      );
    };
  },
});

declare module 'vue' {
  export interface GlobalComponents {
    LFormItem: typeof FormItem;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-form-item': typeof FormItem;
  }
}

export const defineFormItem = createDefineElement(name, FormItem);
