import { defineSSRCustomElement } from 'custom';
import { useForm, useSetupEdit } from '@lun/core';
import { createDefineElement, warn } from 'utils';
import { formProps } from './type';
import { useCEExpose, useNamespace } from 'hooks';
import { FormItemCollector, FormProvideExtra } from '.';
import { computed, reactive, ref, watch } from 'vue';
import { isArray, isObject, objectGet, objectSet, pick, stringToPath } from '@lun/utils';

const name = 'form';
export const Form = defineSSRCustomElement({
  name,
  props: formProps,
  emits: ['update'],
  setup(props, { emit }) {
    const ns = useNamespace(name);
    const form = isObject(props.form) ? props.form : useForm(pick(props, ['defaultFormData', 'defaultFormState']));
    __DEV__ &&
      watch(
        () => props.form,
        () => {
          warn(`Prop 'form' cannot be dynamically changed, should be set before form mount`);
        }
      );
    form.setup();

    const methods: Pick<FormProvideExtra, 'getValue' | 'setValue' | 'deletePath' | 'isPlainName'> = {
      getValue(path) {
        if (!path) return;
        if (isArray(path) || !methods.isPlainName(path)) return objectGet(form.formData, path);
        else return form.formData[path];
      },
      setValue(path, value) {
        if (!path) return;
        if (isArray(path) || !methods.isPlainName(path)) objectSet(form.formData, path, value);
        else form.formData[path] = value;
        emit('update', {
          formData: form.formData,
          path,
          value,
        });
      },
      deletePath(path) {
        if (!path) return;
        if (methods.isPlainName(path as any)) path = stringToPath(path as string);
        if (isArray(path)) {
          const last = path.pop();
          const obj = objectGet(form.formData, path);
          if (isObject(obj)) delete obj[last!];
        } else delete form.formData[path];
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
        form,
        formProps: props,
        ...methods,
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
