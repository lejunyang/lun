import { defineSSRCustomElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { createDefineElement, renderElement } from 'utils';
import { formItemProps } from './type';
import { useNamespace } from 'hooks';

const name = 'form-item';
export const FormItem = defineSSRCustomElement({
  name,
  props: formItemProps,
  setup(props) {
    const ns = useNamespace(name);
    useSetupEdit();

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
