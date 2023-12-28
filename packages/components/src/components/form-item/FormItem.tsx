import { defineSSRCustomElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { createDefineElement, renderElement } from 'utils';
import { formItemProps } from './type';
import { useNamespace } from 'hooks';
import { FormItemCollector } from '../form';
import { ComponentInternalInstance, computed, onBeforeUnmount } from 'vue';
import { FormInputCollector } from '.';
import {
  ensureNumber,
  isArray,
  isObject,
  isPlainString,
  runIfFn,
  stringToPath,
  toArrayIfNotNil,
  virtualGetMerge,
} from '@lun/utils';
import { defineIcon } from '../icon/Icon';
import { GlobalStaticConfig } from 'config';

const name = 'form-item';
export const FormItem = defineSSRCustomElement({
  name,
  props: formItemProps,
  setup(itemProps) {
    const formContext = FormItemCollector.child();
    const props = computed(() =>
      virtualGetMerge(
        itemProps,
        runIfFn(formContext?.parent?.props.itemProps, { formContext, formItemProps: itemProps }),
      ),
    );
    const ns = useNamespace(name, { parent: formContext?.parent });
    const [editComputed] = useSetupEdit();
    const isPlainName = computed(() => {
      return formContext?.isPlainName(props.value.name);
    });
    const path = computed(() => {
      const { name } = props.value;
      if (!name) return;
      return isPlainName.value ? name : stringToPath(name);
    });
    const getIndex = (vm?: ComponentInternalInstance) => {
      if (!vm) return;
      const el = inputContext.childrenVmElMap.get(vm);
      return inputContext.childrenElIndexMap.get(el!);
    };
    const getValue = (vm?: ComponentInternalInstance, value?: any) => {
      const { array } = props.value;
      if (!path.value || !formContext) return;
      const getOrSet = value !== undefined ? formContext.setValue : formContext.getValue;
      if (isObject(value) && 'value' in value) value = value.value;
      if (!array) return getOrSet(path.value, value);
      const index = getIndex(vm);
      if (index === undefined) return;
      return getOrSet(toArrayIfNotNil(path.value).concat(String(index)), value);
    };
    const inputContext = FormInputCollector.parent({
      extraProvide: { getValue, setValue: getValue },
      onChildRemoved(_, index) {
        // delete the value of the removed child if this form item is an array
        const { array } = props.value;
        if (!formContext || !array || !path.value) return;
        const value = formContext.getValue(path.value);
        if (isArray(value)) value.splice(index, 1);
      },
    });
    const transform = (val: any, type = 'number') => {
      if (typeof val === type) return val;
      if (!isPlainString(val) || !formContext) return;
      const path = isPlainName.value ? val : stringToPath(val);
      const value = formContext.getValue(path);
      switch (type) {
        case 'number':
          const { isNaN, toNumber } = GlobalStaticConfig.math;
          const numValue = toNumber(value);
          return isNaN(numValue) ? undefined : numValue;
      }
    };
    const depValues = computed(() => {
      const { deps } = props.value;
      if (!formContext || !deps) return;
      return toArrayIfNotNil(deps).map((name) => formContext.getValue(name));
    });
    const validateProps = computed(() => {
      // TODO plainNameSet in form, depsMatch(deps: string[], match: (values: any[]) => boolean)
      // transform min, max, lessThan, greaterThan, len, step, precision from props, if they are number, return it, if it's string, consider it as a path, try to get it from formContext, judge if the value is number, return if true, otherwise return undefined
      const { min, max, lessThan, greaterThan, len, step, precision, type, required, requireWhenDepRequired } =
        props.value;
      // TODO type === 'date'
      return {
        type,
        required: required || false,
        min: transform(min),
        max: transform(max),
        lessThan: transform(lessThan),
        greaterThan: transform(greaterThan),
        len: transform(len),
        step: transform(step),
        precision: transform(precision),
      };
    });

    onBeforeUnmount(() => {
      if (!formContext || !path.value) return;
      switch (props.value.unmountBehavior) {
        case 'delete':
          formContext.deletePath(path.value);
          break;
        case 'null':
          formContext.setValue(path.value, null);
          break;
        case 'undefined':
          formContext.setValue(path.value, undefined);
          break;
      }
    });

    return () => {
      let {
        colonMark,
        requiredMark,
        requiredMarkAlign,
        required,
        colSpan,
        rowSpan,
        newLine,
        fullLine,
        labelWrapperStyle,
        contentWrapperStyle,
        element,
        elementProps,
        label,
        noLabel,
      } = props.value;
      if (fullLine && formContext?.parent) colSpan = ensureNumber(formContext.parent.props.cols, 1);
      const rMark = required && requiredMark && (
        <span class={[ns.e('required-mark')]} part={ns.p('required-mark')}>
          {requiredMark}
        </span>
      );
      return (
        <div class={[ns.s(editComputed), ns.is('required', required)]} part={ns.p('root')}>
          {!noLabel && (
            <span
              part={ns.p('label')}
              class={[ns.e('label')]}
              style={{
                gridColumnStart: newLine || fullLine ? 1 : undefined,
                gridRowStart: rowSpan && `span ${rowSpan}`,
                ...labelWrapperStyle,
              }}
            >
              {requiredMarkAlign === 'start' && rMark}
              <slot name="label-start"></slot>
              <slot name="label">{label}</slot>
              {requiredMarkAlign === 'end' && rMark}
              {/* help icon */}
              {colonMark && (
                <span class={ns.e('colon')} part={ns.p('colon')}>
                  {colonMark}
                </span>
              )}
              <slot name="label-end"></slot>
            </span>
          )}
          <span
            part={ns.p('content')}
            style={{
              gridColumnStart: colSpan && `span ${colSpan * 2 - 1}`,
              gridColumnEnd: fullLine ? -1 : undefined,
              gridRowStart: rowSpan && `span ${rowSpan}`,
              ...contentWrapperStyle,
            }}
          >
            {element ? (
              renderElement(element, runIfFn(elementProps, { formContext, formItemProps: props.value }), <slot />)
            ) : (
              <slot />
            )}
          </span>
        </div>
      );
    };
  },
});

export type tFormItem = typeof FormItem;

export const defineFormItem = createDefineElement(name, FormItem, {
  icon: defineIcon,
});
