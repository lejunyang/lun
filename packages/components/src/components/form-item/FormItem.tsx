import { defineSSRCustomElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { createDefineElement } from 'utils';
import { formItemProps } from './type';
import { useNamespace } from 'hooks';
import { FormItemCollector } from '../form';
import { ComponentInternalInstance, computed } from 'vue';
import { FormInputCollector } from '.';

const name = 'form-item';
export const FormItem = defineSSRCustomElement({
  name,
  props: formItemProps,
  setup(props) {
    const ns = useNamespace(name);
    useSetupEdit();
    const formContext = FormItemCollector.child();

    const isPlainName = computed(() => {
      return props.plainName ?? formContext?.formProps.plainName ?? false;
    });
    const getIndex = (vm?: ComponentInternalInstance) => {
      if (!vm) return;
      const el = inputContext.childrenVmElMap.get(vm);
      return inputContext.childrenElIndexMap.get(el!);
    };
    const getValue = (vm?: ComponentInternalInstance, value?: any) => {
      const { name, array } = props;
      if (!name || !formContext) return;
      const getOrSet = value !== undefined ? formContext.setValue : formContext.getValue;
      if (!array) return getOrSet(name, value);
      const index = getIndex(vm);
      if (index === undefined) return;
      return getOrSet(`${name}.${index}`, value);
    };
    const inputContext = FormInputCollector.parent({
      extraProvide: { getValue, setValue: getValue },
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
