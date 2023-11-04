import { defineSSRCustomElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { createDefineElement } from 'utils';
import { formItemProps } from './type';
import { useNamespace, useSetupContextEvent } from 'hooks';
import { FormItemCollector } from '../form';
import { ComponentInternalInstance, computed } from 'vue';
import { FormInputCollector } from '.';
import { isObject, stringToPath, toArrayIfNotNil } from '@lun/utils';
import { defineIcon } from '../icon/Icon';

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
      if (isObject(value) && 'value' in value) value = value.value;
      const path = isPlainName.value ? name : stringToPath(name);
      if (!array) return getOrSet(path, value);
      const index = getIndex(vm);
      if (index === undefined) return;
      return getOrSet(toArrayIfNotNil(path).concat(String(index)), value);
    };
    const inputContext = FormInputCollector.parent({
      extraProvide: { getValue, setValue: getValue },
    });

    return () => {
      return (
        <div class={[ns.b(), ns.is('required', props.required)]}>
          {!props.noLabel && (
            <span part="label" class={[ns.e('label')]}>
              {/*  */}
              <slot name="label-start"></slot>
              <slot name="label">{props.label}</slot>
              {/* help icon */}
              <slot name="label-end"></slot>
            </span>
          )}
          <slot></slot>
        </div>
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

export const defineFormItem = createDefineElement(name, FormItem, {
  icon: defineIcon,
});
