import { defineSSRCustomElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { createDefineElement, renderElement } from 'utils';
import { formProps } from './type';
import { useNamespace } from 'hooks';

const name = 'form';
export const Form = defineSSRCustomElement({
  name,
  props: formProps,
  setup(props) {
    const ns = useNamespace(name);
    const [editComputed, editState] = useSetupEdit();

    return () => {
      return (
        <form>
          <slot></slot>
        </form>
      );
    };
  },
});

declare module 'vue' {
  export interface GlobalComponents {
    LForm: typeof Form;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-form': typeof Form;
  }
}

export const defineForm = createDefineElement(name, Form);
