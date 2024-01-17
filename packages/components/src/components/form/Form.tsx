import { defineSSRCustomElement } from 'custom';
import { useForm, useSetupEdit } from '@lun/core';
import { createDefineElement, warn } from 'utils';
import { formEmits, formProps } from './type';
import { useCEExpose, useNamespace } from 'hooks';
import { FormItemCollector } from '.';
import { getCurrentInstance, onBeforeUnmount, watch } from 'vue';
import { isObject, pick } from '@lun/utils';

const name = 'form';
export const Form = defineSSRCustomElement({
  name,
  props: formProps,
  emits: formEmits,
  setup(props, { emit }) {
    const ns = useNamespace(name);

    if (__DEV__) {
      if (props.instance && isObject(props.instance) && !(props.instance as any)[Symbol.for('use-form')]) {
        throw new Error(`Prop 'instance' should be a useForm instance`);
      }
      watch(
        () => props.instance,
        () => {
          warn(`Prop 'instance' cannot be dynamically changed, should be set before form mount`);
        },
      );
    }

    const form = isObject(props.instance)
      ? props.instance
      : useForm(pick(props, ['defaultFormData', 'defaultFormState']));

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

    onBeforeUnmount(
      form.hooks.onUpdateValue.use((param) => {
        emit('update', param);
      }),
    );
    FormItemCollector.parent({
      extraProvide: {
        form,
        formProps: props,
      },
    });

    useCEExpose(form);
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
