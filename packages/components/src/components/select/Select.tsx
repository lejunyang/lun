import { defineSSRCustomFormElement } from 'custom';
import { ComponentInternalInstance, computed, ref, toRef } from 'vue';
import { createDefineElement, renderElement } from 'utils';
import { selectProps } from './type';
import { definePopover } from '../popover/Popover';
import { useSelect, useSetupEdit } from '@lun/core';
import { toArrayIfNotNil } from '@lun/utils';
import { defineInput } from '../input/Input';
import { defineSelectOption } from './SelectOption';
import { SelectCollector } from '.';
import { defineSelectOptgroup } from './SelectOptgroup';
import { getAllThemeValuesFromInstance, useCEExpose, useNamespace, useOptions, useValueModel } from 'hooks';
import { pickThemeProps } from 'common';
import { defineSpin } from '../spin/Spin';

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

    const data = computed(() => {
      const childrenValuesSet = new Set<any>();
      const valueToChildMap = new Map<any, ComponentInternalInstance>();
      children.value.forEach((child) => {
        const { value } = child.props;
        if (value != null) {
          childrenValuesSet.add(value);
          valueToChildMap.set(value, child);
        }
      });
      return { childrenValuesSet, valueToChildMap };
    });

    const methods = useSelect({
      multiple: toRef(props, 'multiple'),
      value: valueModel,
      valueSet: selectedValueSet,
      onChange(value) {
        valueModel.value = value;
      },
      allValues: () => data.value.childrenValuesSet,
    });
    const children = SelectCollector.parent({
      extraProvide: methods,
    });

    const customTagProps = (value: any) => {
      const child = data.value.valueToChildMap.get(value);
      if (child)
        return {
          ...getAllThemeValuesFromInstance(child),
          label: child.props.label || value,
        };
      else return { label: value };
    };

    useCEExpose({
      ...methods,
      focus: (options?: { preventScroll?: boolean; cursor?: 'start' | 'end' | 'all' }) =>
        inputRef.value?.focus(options),
      blur: () => inputRef.value?.blur(),
    });

    const { render, loading, options } = useOptions(props, 'select-option', 'select-optgroup');

    const contentOnPointerDown = () => {
      requestAnimationFrame(() => {
        inputRef.value?.focus();
      });
    };

    // TODO ArrowUp down popup
    return () => {
      const { multiple } = props;
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
              children: ({ isShow }: { isShow: boolean }) =>
                renderElement(
                  'input',
                  {
                    ...attrs,
                    ...themeProps,
                    ref: inputRef,
                    multiple,
                    readonly: true,
                    value: multiple ? valueModel.value : customTagProps(valueModel.value).label,
                    tagProps: customTagProps,
                  },
                  <>
                    {loading.value
                      ? renderElement('spin', { slot: 'suffix' })
                      : renderElement('icon', { name: isShow ? 'up' : 'down', slot: 'suffix' })}
                  </>,
                ),
              // TODO pick props
            },
            // do not use <>...</> here, it will cause popover default slot not work, as Fragment will render as comment, comment node will also override popover default slot content
            <div class={ns.e('content')} part="content" slot="pop-content" onPointerdown={contentOnPointerDown}>
              {!children.value.length && !options.value?.length ? (
                <slot name="no-content">No content</slot>
              ) : (
                <>
                  {render()}
                  {/* slot for select children, also assigned to popover content slot */}
                  <slot></slot>
                </>
              )}
            </div>,
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
  popover: definePopover,
  input: defineInput,
  spin: defineSpin,
});
