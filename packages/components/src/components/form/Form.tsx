import { defineSSRCustomElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { createDefineElement } from 'utils';
import { formProps } from './type';
import { useCEExpose, useNamespace } from 'hooks';
import { FormItemCollector, FormProvideExtra } from '.';
import { computed, reactive, ref } from 'vue';
import { isArray, isObject, objectGet, objectSet, stringToPath } from '@lun/utils';

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
    const methods: Pick<FormProvideExtra, 'getValue' | 'setValue' | 'deletePath' | 'isPlainName'> = {
      getValue(path) {
        if (!path) return;
        if (isArray(path) || !methods.isPlainName(path)) return objectGet(formData.value, path);
        else return formData.value[path];
      },
      setValue(path, value) {
        if (!path) return;
        if (isArray(path) || !methods.isPlainName(path)) objectSet(formData.value, path, value);
        else localFormData.value[path] = value;
        emit('update', {
          formData: formData.value,
          path,
          value,
        });
      },
      deletePath(path) {
        if (!path) return;
        if (methods.isPlainName(path as any)) path = stringToPath(path as string);
        if (isArray(path)) {
          const last = path.pop();
          const obj = objectGet(formData.value, path);
          if (isObject(obj)) delete obj[last!];
        } else delete localFormData.value[path];
      },
      isPlainName(name) {
        return props.plainName || plainNameSet.value.has(name);
      },
    };
    const plainNameSet = computed(() => {
      return new Set(formItems.value.map((i) => (i.props.plainName ? i.props.name : null)).filter(Boolean));
    });
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
