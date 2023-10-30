import { defineSSRCustomFormElement } from 'custom';
import { computed, ref, toRef, IntrinsicElementAttributes } from 'vue';
import { createDefineElement, error, renderElement } from 'utils';
import { selectProps } from './type';
import { definePopover } from '../popover/Popover';
import { usePromiseRef, useSelect } from '@lun/core';
import { runIfFn, toArrayIfNotNil } from '@lun/utils';
import { defineInput } from '../input/Input';
import { defineSelectOption } from './SelectOption';
import { SelectCollector } from '.';
import { defineSelectOptGroup } from './SelectOptGroup';
import { useCEExpose, useValueModel } from 'hooks';
import { defineCustomRenderer } from '../custom-renderer';

export const Select = defineSSRCustomFormElement({
  name: 'select',
  props: selectProps,
  inheritAttrs: false,
  emits: ['update'],
  setup(props, { emit }) {
    const valueModel = useValueModel(props, {
      passive: true,
      emit: (name, value) => {
        emit(name as any, value);
        // if it's multiple, keep focus after change
        if (props.multiple && inputRef.value) inputRef.value.focus();
      },
    });
    const selectedValueSet = computed(() => new Set(toArrayIfNotNil(props.value)));
    const inputRef = ref();
    const popoverRef = ref<IntrinsicElementAttributes['l-popover']>();

    const childValueSet = computed<Set<any>>(
      () => new Set(children.value.flatMap((i) => (i.props.value != null ? [i.props.value] : [])))
    );
    const methods = useSelect({
      multiple: toRef(props, 'multiple'),
      value: valueModel,
      valueSet: selectedValueSet,
      onChange(value) {
        valueModel.value = value;
      },
      allValues: childValueSet,
    });
    const children = SelectCollector.parent({
      extraProvide: methods,
    });

    useCEExpose({
      ...methods,
      focus: (options?: { preventScroll?: boolean; cursor?: 'start' | 'end' | 'all' }) =>
        inputRef.value?.focus(options),
      blur: () => inputRef.value?.blur(),
    });

    const options = usePromiseRef(() => runIfFn(props.options), {
      fallbackWhenReject: (err) => {
        error(err);
        return [];
      },
    });
    const renderOption = (i: any, index: number) =>
      renderElement('select-option', { ...i, key: i.value + index }, i.label);
    // TODO ArrowUp down popup
    return () => {
      return (
        <>
          {renderElement(
            'popover',
            {
              triggers: ['click', 'focus'],
              fullPopWidth: true,
              showArrow: true,
              ref: popoverRef,
              toggleMode: true,
              // TODO pick props
            },
            <>
              {/* select input element */}
              {renderElement('input', {
                ref: inputRef,
                multiple: props.multiple,
                readonly: true,
                value: valueModel.value,
              })}
              <div part="pop-content" slot="pop-content">
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
                <slot></slot>
                {!children.value.length && <slot name="no-content">No content</slot>}
              </div>
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
