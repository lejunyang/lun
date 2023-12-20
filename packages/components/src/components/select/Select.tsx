import { defineSSRCustomFormElement } from 'custom';
import { computed, ref, toRef } from 'vue';
import { createDefineElement, renderElement } from 'utils';
import { selectProps } from './type';
import { definePopover } from '../popover/Popover';
import { useSelect, useSetupEdit } from '@lun/core';
import { toArrayIfNotNil } from '@lun/utils';
import { defineInput } from '../input/Input';
import { defineSelectOption } from './SelectOption';
import { SelectCollector } from '.';
import { defineSelectOptgroup } from './SelectOptgroup';
import { useCEExpose, useNamespace, useOptions, useValueModel } from 'hooks';
import { defineCustomRenderer } from '../custom-renderer';
import { pickThemeProps } from 'common';

const name = 'select';
export const Select = defineSSRCustomFormElement({
  name,
  props: selectProps,
  inheritAttrs: false,
  emits: ['update'],
  setup(props, { emit, attrs }) {
    const ns = useNamespace(name);
    const [editComputed] = useSetupEdit();
    const valueModel = useValueModel(props, {
      emit: (name, value) => {
        emit(name as any, value);
        // if it's multiple, keep focus after change
        if (props.multiple && inputRef.value) inputRef.value.focus();
      },
    });
    const selectedValueSet = computed(() => new Set(toArrayIfNotNil(valueModel.value)));
    const inputRef = ref();
    const popoverRef = ref<any>();

    const childValueSet = computed<Set<any>>(
      () => new Set(children.value.flatMap((i) => (i.props.value != null ? [i.props.value] : []))),
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

    const { render } = useOptions(props, 'select-option', 'select-optgroup');

    // TODO ArrowUp down popup
    return () => {
      const themeProps = pickThemeProps(props);
      return (
        <>
          {renderElement(
            'popover',
            {
              ...themeProps,
              class: [ns.s(editComputed)],
              triggers: ['click', 'focus'],
              sync: 'width',
              showArrow: false,
              ref: popoverRef,
              toggleMode: true,
              useTransform: false,
              placement: 'bottom-start',
              // TODO pick props
            },
            <>
              {/* select input element */}
              {renderElement('input', {
                ...attrs,
                ...themeProps,
                ref: inputRef,
                multiple: props.multiple,
                readonly: true,
                value: valueModel.value,
              })}
              <div class={ns.e('content')} part="content" slot="pop-content">
                {render()}
                {/* slot for select children, also assigned to popover content slot */}
                <slot></slot>
                {!children.value.length && <slot name="no-content">No content</slot>}
              </div>
            </>,
          )}
        </>
      );
    };
  },
});

export type tSelect = typeof Select;

export const defineSelect = createDefineElement('select', Select, {
  'select-option': defineSelectOption,
  'select-optgroup': defineSelectOptgroup,
  'custom-renderer': defineCustomRenderer,
  popover: definePopover as any,
  input: defineInput,
});
