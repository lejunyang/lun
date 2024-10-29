import { defineSSRCustomElement } from '../../custom/apiCustomElement';
import { UseFormReturn, unrefOrGet, useCleanUp, useForm, useSetupEdit } from '@lun-web/core';
import { createDefineElement } from 'utils';
import { formEmits, formProps } from './type';
import { useBreakpoint, useCEStates, useNamespace } from 'hooks';
import { FormItemCollector } from '.';
import { computed, getCurrentInstance, normalizeStyle, onBeforeUnmount, ref, shallowReactive, watch } from 'vue';
import { ensureNumber, getCachedComputedStyle, pick, supportCSSSubgrid, toPxIfNum } from '@lun-web/utils';
import { defineTooltip } from '../tooltip';
import { FormProvideExtra, provideErrorTooltip, provideHelpTooltip } from './collector';
import { getCompParts } from 'common';

const name = 'form';
const parts = ['root'] as const;
const compParts = getCompParts(name, parts);
export const Form = defineSSRCustomElement({
  name,
  props: formProps,
  emits: formEmits,
  setup(props, { emit, attrs }) {
    const ns = useNamespace(name);
    const vm = getCurrentInstance()!, { ce } = vm;

    const colsRef = useBreakpoint(props, 'cols', (v) => ensureNumber(v, 1));
    const layoutRef = useBreakpoint(props, 'layout');
    const labelLayoutRef = useBreakpoint(props, 'labelLayout');
    const labelWidthRef = useBreakpoint(props, 'labelWidth', toPxIfNum);

    const layoutInfo = computed(() => {
      let cols = colsRef.value,
        layout = layoutRef.value,
        label = labelLayoutRef.value,
        formLabelWidth = labelWidthRef.value;
      const isGrid = layout === 'grid' || layout === 'inline-grid',
        isFlex = layout === 'flex' || layout === 'inline-flex',
        hasLabel = !['none', 'float', 'placeholder'].includes(label!),
        isHorizontal = label === 'horizontal',
        isVertical = label === 'vertical';
      if (!formLabelWidth) {
        if (isGrid) formLabelWidth = 'max-content';
        else if (isFlex) formLabelWidth = '33.33%';
      }
      return {
        isGrid,
        isFlex,
        hasLabel,
        formStyle: {
          display: layout,
          gridTemplateColumns: isGrid ? `repeat(${cols}, ${isHorizontal ? formLabelWidth : ''} 1fr)` : '',
          flexWrap: 'wrap',
        },
        itemState: {
          horizontalLabel: isHorizontal,
          verticalLabel: isVertical,
        },
        getItemStyles({ fullLine, newLine, endLine, rowSpan, colSpan, labelWidth }) {
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
              if (supportCSSSubgrid && props.preferSubgrid) {
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
          } else if (isFlex) {
            hostStyle = `:host{display:contents}`;
            const gapNum = cols - colSpan,
              form = formRef.value;
            rootStyle = {
              flex: `1 1 calc((100% - ${
                form ? getCachedComputedStyle(form).columnGap : '0px'
              } * ${gapNum}) * ${colSpan} / ${cols})`,
              display: 'flex',
              flexDirection: isVertical ? 'column' : 'row',
            };
            if (isHorizontal) {
              labelStyle = {
                flex: `0 0 ${labelWidth || formLabelWidth}`,
                maxWidth: labelWidth,
              };
              contentStyle = {
                flex: '1 1 0',
                minWidth: 0,
                maxWidth: `calc(100% - ${labelWidth})`,
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

    let currentForm: UseFormReturn;
    const provide = shallowReactive({
      form: undefined as any as UseFormReturn, // update it later in watch
      formProps: props,
      layoutInfo,
    });

    const onUpdate = (param: any) => {
      emit('update', param);
    };
    const [addClean, cleanUp] = useCleanUp();
    watch(
      () => unrefOrGet(props.instance),
      (newForm, oldForm) => {
        cleanUp();
        if (oldForm) oldForm.hooks.onFormDisconnected.exec(vm);
        if (__DEV__) {
          if (newForm && !(newForm as any)[Symbol.for('use-form')]) {
            throw new Error(`Prop 'instance' should be a useForm instance`);
          }
        }
        if (!newForm) {
          newForm = useForm(pick(props, ['defaultData', 'defaultFormState']));
        }
        newForm.hooks.onFormConnected.exec(vm);
        addClean(newForm.hooks.onUpdateValue.use(onUpdate));
        currentForm = newForm;
        provide.form = newForm;
        ce && Object.defineProperties(ce, Object.getOwnPropertyDescriptors(currentForm));
      },
      { immediate: true },
    );

    const formRef = ref<HTMLFormElement>();
    useSetupEdit({
      adjust(state) {
        (['disabled', 'readonly', 'loading'] as const).forEach((key) => {
          if (currentForm.formState[key] !== undefined) state[key] = currentForm.formState[key];
        });
      },
    });
    onBeforeUnmount(() => {
      currentForm.hooks.onFormDisconnected.exec(vm);
    });

    FormItemCollector.parent({
      extraProvide: provide,
    });

    const [stateClass] = useCEStates(() => ({}), ns);

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
        <form
          ref={formRef}
          class={stateClass.value}
          part={compParts[0]}
          style={normalizeStyle([layoutInfo.value.formStyle, attrs.style])}
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
export type FormExpose = UseFormReturn;
export type iForm = InstanceType<tForm> & FormExpose;

export const defineForm = createDefineElement(
  name,
  Form,
  {
    layout: 'grid',
    cols: '1',
    preferSubgrid: true,
    labelLayout: 'horizontal',
  },
  parts,
  {
    tooltip: defineTooltip,
  },
);
