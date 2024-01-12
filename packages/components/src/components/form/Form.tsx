import { defineSSRCustomElement } from 'custom';
import { useForm, useSetupEdit } from '@lun/core';
import { createDefineElement, warn } from 'utils';
import { formEmits, formProps } from './type';
import { useCEExpose, useNamespace } from 'hooks';
import { FormItemCollector, FormProvideExtra } from '.';
import { computed, getCurrentInstance, onBeforeUnmount, watch } from 'vue';
import { isArray, isObject, objectGet, objectSet, pick, stringToPath } from '@lun/utils';

const name = 'form';
export const Form = defineSSRCustomElement({
  name,
  props: formProps,
  emits: formEmits,
  setup(props, { emit }) {
    const ns = useNamespace(name);
    const form = isObject(props.formManager)
      ? props.formManager
      : useForm(pick(props, ['defaultFormData', 'defaultFormState']));
    __DEV__ &&
      watch(
        () => props.formManager,
        () => {
          warn(`Prop 'formManager' cannot be dynamically changed, should be set before form mount`);
        },
      );
    const vm = getCurrentInstance()!;
    const [editComputed] = useSetupEdit({
      adjust(state) {
        (['disabled', 'readonly', 'loading'] as const).forEach((key) => {
          if (form.formState[key] !== undefined) state[key] = form.formState[key];
        });
      },
    });
    form.hooks.onFormSetup.exec(vm);
    onBeforeUnmount(() => {
      form.hooks.onFormUnmount.exec(vm);
    });

    const methods: Pick<FormProvideExtra, 'getValue' | 'setValue' | 'deletePath' | 'isPlainName'> = {
      getValue(path) {
        if (!path) return;
        if (isArray(path) || !methods.isPlainName(path)) return objectGet(form.formData, path);
        else return form.formData[path];
      },
      setValue(path, value) {
        if (!path) return;
        if (isArray(path) || !methods.isPlainName(path)) {
          if (!path.length) return;
          objectSet(form.formData, path, value);
        } else form.formData[path] = value;
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
          if (!path.length) return;
          const last = path.pop();
          const obj = objectGet(form.formData, path);
          if (isObject(obj)) delete obj[last!];
        } else delete form.formData[path];
        emit('update', {
          formData: form.formData,
          path,
          value: undefined,
          isDelete: true,
        });
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
      const { layout, cols, labelWidth } = props;
      const isGrid = layout?.includes('grid');
      return (
        <form
          class={[ns.s(editComputed), ns.is(`layout-grid`, isGrid)]}
          part={ns.p('root')}
          style={{
            display: layout,
            gridTemplateColumns: isGrid
              ? `repeat(${cols}, [label-start] ${labelWidth} [content-start] 1fr)`
              : undefined,
          }}
        >
          <slot></slot>
        </form>
      );
    };
  },
});

export type tForm = typeof Form;

export const defineForm = createDefineElement(name, Form);
