import { defineSSRCustomElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { createDefineElement } from 'utils';
import { formItemProps } from './type';
import { useNamespace } from 'hooks';
import { FormItemCollector } from '../form';
import { ComponentInternalInstance, computed } from 'vue';
import { FormInputCollector } from '.';
import { isObject, isPlainString, stringToPath, toArrayIfNotNil } from '@lun/utils';
import { defineIcon } from '../icon/Icon';
import { GlobalStaticConfig } from 'config';

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
    const transform = (val: any, type = 'number') => {
      if (typeof val === type) return val;
      if (!isPlainString(val) || !formContext) return;
      const path = isPlainName.value ? val : stringToPath(val);
      const value = formContext.getValue(path);
      switch (type) {
        case 'number':
          const { isNaN, toNumber } = GlobalStaticConfig.math;
          const numValue = toNumber(value);
          return isNaN(numValue) ? undefined : numValue;
      }
    };
    const validateProps = computed(() => {
      // transform min, max, lessThan, moreThan, len, step, precision from props, if they are number, return it, if it's string, consider it as a path, try to get it from formContext, judge if the value is number, return if true, otherwise return undefined
      const { min, max, lessThan, moreThan, len, step, precision, type } = props;
      // TODO type === 'date'
      return {
        min: transform(min),
        max: transform(max),
        lessThan: transform(lessThan),
        moreThan: transform(moreThan),
        len: transform(len),
        step: transform(step),
        precision: transform(precision),
      };
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
