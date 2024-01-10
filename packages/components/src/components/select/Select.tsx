import { defineSSRCustomFormElement } from 'custom';
import { ComponentInternalInstance, computed, ref, toRef, mergeProps, nextTick } from 'vue';
import { createDefineElement, renderElement } from 'utils';
import { selectEmits, selectProps } from './type';
import { definePopover } from '../popover/Popover';
import { refLikesToGetters, useSelect, useSetupEdit, useTempState } from '@lun/core';
import { isFunction, toArrayIfNotNil } from '@lun/utils';
import { defineInput } from '../input/Input';
import { defineSelectOption } from './SelectOption';
import { SelectCollector } from '.';
import { defineSelectOptgroup } from './SelectOptgroup';
import {
  CommonOption,
  getAllThemeValuesFromInstance,
  useCEExpose,
  useNamespace,
  useOptions,
  useValueModel,
} from 'hooks';
import { intl, pickThemeProps } from 'common';
import { defineSpin } from '../spin/Spin';
import { defineButton } from '../button/Button';
import { useActivateOption } from './useActivateOption';

const name = 'select';
export const Select = defineSSRCustomFormElement({
  name,
  props: selectProps,
  inheritAttrs: false,
  emits: selectEmits,
  setup(props, { emit, attrs }) {
    const ns = useNamespace(name);
    const [editComputed] = useSetupEdit();
    const valueModel = useValueModel(props, {
      emit: (name, value) => {
        emit(name as any, value);
        const { autoClose, multiple } = props;
        // if it's multiple, keep focus after input change
        if (multiple) {
          inputRef.value?.focus();
        } else if (autoClose && value) {
          // it has to be after rootOnPointerDown rAF, or focus will reopen popover
          setTimeout(() => {
            popoverRef.value?.closePopover();
          }, 20);
        }
      },
    });
    const selectedValueSet = computed(() => new Set(toArrayIfNotNil(valueModel.value)));
    const inputRef = ref();
    const popoverRef = ref<any>();

    const data = computed(() => {
      const childrenValuesSet = new Set<any>();
      const valueToChildMap = new Map<any, ComponentInternalInstance>();
      context.value.forEach((child) => {
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
    const context = SelectCollector.parent({
      extraProvide: {
        ...methods,
        isHidden(option) {
          const { hideOptionWhenSelected, multiple, filter } = props;
          const isSelected = methods.isSelected(option.value);
          let filterResult: boolean | undefined = true;
          // only filter when input value changed once
          if (inputValue.changedOnce) {
            if (filter === true) {
              filterResult = option.label?.toLowerCase().includes(inputValue.value?.toLowerCase() ?? '');
            } else if (isFunction(filter)) filterResult = filter(inputValue.value, option);
          }
          return (hideOptionWhenSelected && multiple && isSelected) || !filterResult;
        },
        isActive(vm) {
          return activateMethods.isActive(vm);
        },
        activate(vm) {
          activateMethods.activate(vm);
        },
        deactivate() {
          activateMethods.deactivate();
        },
      },
    });
    const { methods: activateMethods, handlers: activateHandlers } = useActivateOption(context, () => props); // can not use props directly, as it has 'value' prop...

    const childrenAllHidden = computed(() => {
      return context.value.every((i) => i.exposed?.hidden);
    });

    const customTagProps = (value: any) => {
      const child = data.value.valueToChildMap.get(value);
      return {
        ...(child ? getAllThemeValuesFromInstance(child) : themeProps.value),
        label: child?.props.label || value,
      };
    };

    useCEExpose(
      {
        ...methods,
        focus: (options?: { preventScroll?: boolean; cursor?: 'start' | 'end' | 'all' }) =>
          inputRef.value?.focus(options),
        blur: () => inputRef.value?.blur(),
      },
      refLikesToGetters({
        input: inputRef,
        popover: popoverRef,
      }),
    );

    const { render, loading, options, renderOptions } = useOptions(props, 'select-option', 'select-optgroup');

    const contentOnPointerDown = () => {
      requestAnimationFrame(() => {
        inputRef.value?.focus();
      });
    };

    const themeProps = computed(() => pickThemeProps(props));
    const buttons = computed(() => {
      const { multiple, commonButtons } = props;
      if (!multiple || !commonButtons) return;
      const buttonConfigs = {
        selectAll: {
          ...themeProps.value,
          label: intl('select.button.selectAll').d('All'),
          onClick: methods.selectAll,
        },
        reverse: {
          ...themeProps.value,
          label: intl('select.button.reverse').d('Reverse'),
          onClick: methods.reverse,
        },
        clear: {
          ...themeProps.value,
          label: intl('select.button.clear').d('Clear'),
          onClick: methods.unselectAll,
        },
      };
      const result = Object.entries(buttonConfigs)
        .map(([key, config]) => {
          let finalConfig = commonButtons === true ? config : commonButtons[key as keyof typeof buttonConfigs];
          if (!finalConfig) return;
          else if (finalConfig === true) finalConfig = config;
          else finalConfig = mergeProps(config, finalConfig);
          return (
            (commonButtons === true || commonButtons[key as keyof typeof buttonConfigs]) &&
            renderElement('button', {
              ...finalConfig,
              key,
            })
          );
        })
        .filter(Boolean);
      return (
        <>
          {result.length && <div class={ns.e('buttons')}>{result}</div>}
          {result.length && renderElement('divider')}
        </>
      );
    });

    const inputValue = useTempState(() => customTagProps(valueModel.value).label);
    const createdOptions = ref([] as CommonOption[]);
    const createdOptionsRender = computed(() => renderOptions(createdOptions.value));
    const popoverChildren = ({ isShow }: { isShow: boolean }) => {
      const { multiple, filter, freeInput } = props;
      const editable = editComputed.value.editable && (filter || freeInput);
      return renderElement(
        'input',
        {
          // debounce: editable ? 150 : undefined,
          ...attrs,
          ...themeProps.value,
          ...activateHandlers,
          ref: inputRef,
          multiple,
          readonly: !editable,
          value: multiple ? valueModel.value : inputValue.value,
          unique: true,
          onUpdate: (e: CustomEvent) => {
            if (!multiple) {
              inputValue.value = e.detail;
              // if it's not multiple, unselect current when input is cleared
              if (!e.detail) methods.unselectAll();
              emit('inputUpdate', e.detail);
            } else valueModel.value = e.detail;
          },
          onTagsComposing(e: CustomEvent) {
            inputValue.value = e.detail;
            emit('inputUpdate', e.detail);
          },
          onBlur: inputValue.reset,
          onEnterDown() {
            const child = activateMethods.getActiveChild();
            methods.toggle(child?.props.value);
          },
          onTagsAdd(e: CustomEvent<string[]>) {
            const newOptions = e.detail.map((i) => ({ label: i, value: i }));
            methods.select(...e.detail);
            createdOptions.value = createdOptions.value.concat(newOptions);
            nextTick(activateMethods.activateCurrentSelected);
          },
          onTagsRemove(e: CustomEvent) {
            methods.unselect(...e.detail);
          },
          tagProps: customTagProps,
        },
        <>
          {loading.value
            ? renderElement('spin', { slot: 'suffix' })
            : renderElement('icon', { name: isShow ? 'up' : 'down', slot: 'suffix' })}
        </>,
      );
    };

    return () => {
      return (
        <>
          {renderElement(
            'popover',
            {
              ...themeProps.value,
              open: editComputed.value.editable ? undefined : false,
              class: [ns.s(editComputed)],
              triggers: ['click', 'focus'],
              sync: 'width',
              showArrow: false,
              ref: popoverRef,
              toggleMode: true,
              useTransform: false,
              placement: 'bottom-start',
              children: popoverChildren,
              // TODO pick props
            },
            // do not use <>...</> here, it will cause popover default slot not work, as Fragment will render as comment, comment node will also override popover default slot content
            <div class={ns.e('content')} part="content" slot="pop-content" onPointerdown={contentOnPointerDown}>
              {!context.value.length && !options.value?.length ? (
                <slot name="no-content">No content</slot>
              ) : (
                <>
                  {buttons.value}
                  {childrenAllHidden.value && <slot name="no-content">No content</slot>}
                  {createdOptionsRender.value}
                  {render.value}
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
  button: defineButton,
});
