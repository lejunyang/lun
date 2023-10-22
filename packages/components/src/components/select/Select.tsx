import { defineSSRCustomFormElement } from 'custom';
import { computed } from 'vue';
import { createDefineElement, error, renderElement } from 'utils';
import { selectProps } from './type';
import { definePopover } from '../popover/Popover';
import { usePromiseRef } from '@lun/core';
import { runIfFn, toArrayIfNotNil, toNoneNilSet } from '@lun/utils';
import { defineInput } from '../input/Input';
import { defineSelectOption } from './SelectOption';
import { SelectCollector } from '.';
import { defineSelectOptGroup } from './SelectOptGroup';
import { useCEExpose, useValueModel } from 'hooks';
import { defineCustomRenderer } from '../custom-renderer';

// Mui AutoComplete Multiple 左右方向键可以切换chip聚焦，上下方向键可以弹出面板

export const Select = defineSSRCustomFormElement({
  name: 'select',
  props: selectProps,
  inheritAttrs: false,
  setup(props) {
    const valueModel = useValueModel(props, {
      passive: true,
    });
    const selectedValueSet = computed(() => new Set(toArrayIfNotNil(props.value)));

    const methods = {
      isSelected: (value: any) =>
        props.looseEqual
          ? !!toArrayIfNotNil(props.value).find((i: any) => i == value)
          : selectedValueSet.value.has(value),
      selectAll() {
        if (props.multiple) valueModel.value = Array.from(childValueSet.value);
      },
      deselectAll() {
        if (props.multiple) valueModel.value = [];
      },
      select(...values: any[]) {
        if (props.multiple) {
          const valueSet = toNoneNilSet(valueModel.value, values);
          valueModel.value = Array.from(valueSet);
        } else valueModel.value = values[0];
      },
      deselect(...values: any[]) {
        if (props.multiple) {
          const valueSet = new Set(selectedValueSet.value);
          values.forEach((i) => valueSet.delete(i));
          valueModel.value = Array.from(valueSet);
        } else {
          if (valueModel.value === values[0] || values[0] === undefined) valueModel.value = null;
        }
      },
      reverse() {
        if (props.multiple) {
          const valueSet = new Set(new Set(selectedValueSet.value));
          childValueSet.value.forEach((i) => {
            if (valueSet.has(i)) valueSet.delete(i);
            else valueSet.add(i);
          });
          valueModel.value = Array.from(valueSet);
        }
      },
    };
    const children = SelectCollector.parent({
      extraProvide: { ...methods },
    });
    const childValueSet = computed<Set<any>>(
      () => new Set(children.value.flatMap((i) => (i.props.value != null ? [i.props.value] : [])))
    );

    useCEExpose(methods);

    const options = usePromiseRef(() => runIfFn(props.options), {
      fallbackWhenReject: (err) => {
        error(err);
        return [];
      },
    });
    const renderOption = (i: any, index: number) =>
      renderElement(
        'select-option',
        { slot: 'content', value: i.value, class: i.class, style: i.style, key: i.value + index },
        i.label
      );
    return () => {
      return (
        <>
          {renderElement(
            'popover',
            {},
            <>
              {/* select input element */}
              {renderElement('input')}
              {/* options from props, they should be with slot="pop-content" prop so that assigned to popover content */}
              {Array.isArray(options.value) &&
                options.value.map((i: any, index) => {
                  if (Array.isArray(i.children)) {
                    return renderElement(
                      'select-optgroup',
                      { slot: 'content', key: index, class: i.class, style: i.style },
                      i.children.map(renderOption)
                    );
                  }
                  return renderOption(i, index);
                })}
              {/* slot for select children, also assigned to popover content slot */}
              <slot slot="pop-content">content</slot>
            </>
          )}
        </>
      );
    };
  },
});

declare module 'vue' {
  export interface GlobalComponents {
    LSelect: typeof Select;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-select': typeof Select;
  }
}

export const defineSelect = createDefineElement('select', Select, {
  'select-option': defineSelectOption,
  'select-optgroup': defineSelectOptGroup,
  'custom-renderer': defineCustomRenderer,
  popover: definePopover as any,
  input: defineInput,
});
