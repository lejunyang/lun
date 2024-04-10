import { defineSSRCustomElement } from '../../custom/apiCustomElement';
import { UseFormReturn, useForm, useSetupEdit } from '@lun/core';
import { createDefineElement, warn } from 'utils';
import { formEmits, formProps } from './type';
import { useBreakpoint, useCEExpose, useCEStates, useNamespace } from 'hooks';
import { FormItemCollector } from '.';
import { computed, getCurrentInstance, onBeforeUnmount, watch } from 'vue';
import { ensureNumber, isObject, pick, supportSubgrid } from '@lun/utils';
import { defineTooltip } from '../tooltip';
import { FormProvideExtra, provideErrorTooltip, provideHelpTooltip } from './collector';

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

    const colsRef = useBreakpoint(props, 'cols', (v) => ensureNumber(v, 1));
    const layoutRef = useBreakpoint(props, 'layout');
    const labelLayoutRef = useBreakpoint(props, 'labelLayout');
    const labelWidthRef = useBreakpoint(props, 'labelWidth');

    const layoutInfo = computed(() => {
      const cols = colsRef.value,
        layout = layoutRef.value,
        label = labelLayoutRef.value,
        labelWidth = labelWidthRef.value;
      const isGrid = layout === 'grid' || layout === 'inline-grid',
        hasLabel = !['none', 'float', 'placeholder'].includes(label!),
        isHorizontal = label === 'horizontal',
        isVertical = label === 'vertical';
      return {
        isGrid,
        hasLabel,
        formStyle: {
          display: layout,
          gridTemplateColumns: isGrid ? `repeat(${cols}, ${isHorizontal ? labelWidth : ''} 1fr)` : '',
        },
        itemState: {
          'horizontal-label': isHorizontal,
          'vertical-label': isVertical,
        },
        getItemStyles({ fullLine, newLine, endLine, rowSpan, colSpan }) {
          let rootStyle = {},
            labelStyle = {},
            contentStyle = {},
            hostStyle = '';
          colSpan = ensureNumber(fullLine ? cols : colSpan, 1);
          const spanNum = isHorizontal ? colSpan * 2 - 1 : colSpan,
            gridRowStart = rowSpan && `span ${rowSpan}`,
            backStart = endLine ? (isHorizontal ? -spanNum - 2 : -spanNum - 1) : '',
            gridColumnStart = newLine || fullLine ? 1 : backStart,
            span = colSpan && `span ${spanNum}`,
            gridColumnEnd = fullLine || endLine ? -1 : span;
          if (isGrid) {
            hostStyle = `:host{display:contents}`; // :host-context() is not supported in firefox, use this style manually
            if (isVertical) {
              rootStyle = {
                gridRowStart,
                gridColumnStart,
                gridColumnEnd,
              };
            } else if (isHorizontal) {
              if (supportSubgrid && props.preferSubgrid) {
                let fullSpan = `span ${colSpan * 2}`,
                  gridColumn: [any, any] = [fullSpan, fullSpan];
                if (fullLine || (newLine && fullLine)) gridColumn = [1, -1];
                else if (newLine) gridColumn[0] = 1;
                else if (endLine) gridColumn[1] = -1;
                rootStyle = {
                  display: 'grid',
                  gridTemplate: 'subgrid/subgrid',
                  gridColumn: gridColumn.join('/'),
                };
              } else rootStyle = { display: 'contents' };
              labelStyle = {
                gridRowStart,
                gridColumnStart,
              };
              contentStyle = {
                gridRowStart,
                gridColumnStart: span,
                gridColumnEnd,
              };
            }
          }
          return {
            hostStyle,
            rootStyle,
            labelStyle,
            contentStyle,
          };
        },
      };
    }) as FormProvideExtra['layoutInfo'];

    FormItemCollector.parent({
      extraProvide: {
        form,
        formProps: props,
        layoutInfo,
      },
    });

    useCEExpose(form);
    const [stateClass] = useCEStates(() => ({}), ns, editComputed);

    const renderErrorTooltip = provideErrorTooltip({
      class: [ns.e('tooltip'), ns.m('error')],
      preventSwitchWhen: 'edit',
      freezeWhenClosing: true,
    });
    const renderHelpTooltip = provideHelpTooltip({
      class: [ns.e('tooltip'), ns.m('help')],
    });
    return () => {
      return (
        <form class={stateClass.value} part={ns.p('root')} style={layoutInfo.value.formStyle}>
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
