import { defineSSRCustomElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { createDefineElement, renderElement } from 'utils';
import { formProps } from './type';
import { useNamespace } from 'hooks';
import { FormItemCollector } from '.';
import { computed, reactive, ref } from 'vue';

const name = 'form';
export const Form = defineSSRCustomElement({
  name,
  props: formProps,
  setup(props) {
    const ns = useNamespace(name);
    const [editComputed, editState] = useSetupEdit();
    const localFormData = ref({});
    const formData = computed(() => props.formData || localFormData.value);
    const formState = reactive({
      errors: {},
      isChanged: false,
    });
    const formItems = FormItemCollector.parent({
      extraProvide: {
        formData,
        getValue(name) {
          return formData.value[name];
        },
        formState,
      },
    });

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
