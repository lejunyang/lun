import { defineSSRCustomElement } from '../../custom/apiCustomElement';
import { UseFormReturn, useForm, useSetupEdit } from '@lun/core';
import { createDefineElement, warn } from 'utils';
import { formEmits, formProps } from './type';
import { useCEExpose, useCEStates, useNamespace } from 'hooks';
import { FormItemCollector } from '.';
import { getCurrentInstance, onBeforeUnmount, ref, watch } from 'vue';
import { isObject, pick } from '@lun/utils';
import { defineTooltip } from '../tooltip';
import { provideErrorTooltip, provideHelpTooltip } from './collector';

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
    const [stateClass, states] = useCEStates(
      () => ({ 'layout-grid': props.layout?.includes('grid') }),
      ns,
      editComputed,
    );

    const renderErrorTooltip = provideErrorTooltip({
      class: [ns.e('tooltip'), ns.m('error')],
      preventSwitchWhen: 'edit',
      freezeWhenClosing: true,
    });
    const renderHelpTooltip = provideHelpTooltip({
      class: [ns.e('tooltip'), ns.m('help')],
    });
    return () => {
      const { layout, cols, labelWidth } = props;
      return (
        <form
          class={stateClass.value}
          part={ns.p('root')}
          style={{
            display: layout,
            gridTemplateColumns: states.value['layout-grid']
              ? `repeat(${cols}, [label-start] ${labelWidth} [content-start] 1fr)`
              : undefined,
          }}
        >
          <slot></slot>
          {renderErrorTooltip()}
          {renderHelpTooltip()}
        </form>
      );
    };
  },
});

export type tForm = typeof Form;
export type iForm = InstanceType<tForm> & UseFormReturn;

export const defineForm = createDefineElement(name, Form, {
  tooltip: defineTooltip,
});
