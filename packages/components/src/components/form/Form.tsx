import { defineSSRCustomElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { createDefineElement } from 'utils';
import { formProps } from './type';
import { useCEExpose, useNamespace } from 'hooks';
import { FormItemCollector, FormProvideExtra } from '.';
import { computed, reactive, ref } from 'vue';
import { objectGet, objectSet } from '@lun/utils';

const name = 'form';
export const Form = defineSSRCustomElement({
  name,
  props: formProps,
  emits: ['update'],
  setup(props, { emit }) {
    const ns = useNamespace(name);
    const [editComputed, editState] = useSetupEdit();
    const localFormData = ref<Record<string, any>>({});
    const formData = computed(() => (props.formData ? reactive(props.formData) : localFormData.value));
    const formState = reactive({
      errors: {},
      isChanged: false,
    });
    const methods: Pick<FormProvideExtra, 'getValue' | 'setValue'> = {
      getValue(path) {
        if (Array.isArray(path)) return objectGet(formData.value, path);
        else return formData.value[path];
      },
      setValue(path, value) {
        if (Array.isArray(path)) objectSet(formData.value, path, value);
        else localFormData.value[path] = value;
        emit('update', {
          formData: formData.value,
          path,
          value,
        });
      },
    };
    const formItems = FormItemCollector.parent({
      extraProvide: {
        formProps: props,
        formData,
        ...methods,
        formState,
      },
    });

    useCEExpose(methods);

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
