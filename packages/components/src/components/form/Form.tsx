import { defineSSRCustomElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { createDefineElement, renderElement } from 'utils';
import { formProps } from './type';
import { useNamespace } from 'hooks';
import { FormItemCollector } from '.';
import { computed, reactive, ref } from 'vue';
import { objectGet, objectSet } from '@lun/utils';

const name = 'form';
export const Form = defineSSRCustomElement({
  name,
  props: formProps,
  setup(props) {
    const ns = useNamespace(name);
    const [editComputed, editState] = useSetupEdit();
    const localFormData = ref<Record<string, any>>({});
    const formData = computed(() => (props.formData ? reactive(props.formData) : localFormData.value));
    const formState = reactive({
      errors: {},
      isChanged: false,
    });
    const formItems = FormItemCollector.parent({
      extraProvide: {
        formProps: props,
        formData,
        getValue(path) {
          if (Array.isArray(path)) objectGet(formData.value, path);
          else return formData.value[path];
        },
        setValue(path, value) {
          if (Array.isArray(path)) objectSet(formData.value, path, value);
          else localFormData.value[path] = value;
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
