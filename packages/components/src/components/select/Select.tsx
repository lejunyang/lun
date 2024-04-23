import { defineSSRCustomElement } from 'custom';
import { computed, ref, mergeProps, nextTick } from 'vue';
import { createDefineElement, renderElement } from 'utils';
import { selectEmits, selectProps, selectPropsOfPopover } from './type';
import { definePopover, iPopover } from '../popover/Popover';
import { refLikeToDescriptors, useSelectMethods, useSetupEdit, useTempState } from '@lun/core';
import { isFunction, isNilOrEmptyStr, objectKeys, pick, raf } from '@lun/utils';
import { defineInput, iInput } from '../input/Input';
import { defineSelectOption } from './SelectOption';
import { defineSelectOptgroup } from './SelectOptgroup';
import {
  CommonOption,
  getAllThemeValuesFromInstance,
  useCEExpose,
  useCEStates,
  useNamespace,
  useOptions,
  useValueModel,
} from 'hooks';
import { InputFocusOption, intl, pickThemeProps } from 'common';
import { defineSpin } from '../spin/Spin';
import { defineButton } from '../button/Button';
import { useSelect } from './useSelect';

const name = 'select';
export const Select = defineSSRCustomElement({
  name,
  props: selectProps,
  formAssociated: true,
  emits: selectEmits,
  setup(props, { emit, attrs }) {
    const ns = useNamespace(name);
    const [editComputed] = useSetupEdit();
    const valueModel = useValueModel(props, {
      emit: (name, value) => {
        emit(name as any, value);
        // if it's multiple, keep focus after input change
        if (props.multiple) inputRef.value?.focus();
      },
    });
    const inputRef = ref();
    const popoverRef = ref<any>();

    const { context, methods, activateHandlers, activateMethods, valueToChild } = useSelect(props, valueModel, {
      isHidden: (option) => {
        if ((option as any).hidden) return true;
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
      onSingleSelect(value) {
        if (props.autoClose && !isNilOrEmptyStr(value)) popoverRef.value?.delayClosePopover(true);
      },
    });

    const customTagProps = (value: any) => {
      const child = valueToChild(value);
      return {
        ...(child ? getAllThemeValuesFromInstance(child) : themeProps.value),
        label: child?.props.label || value,
      };
    };

    useCEExpose(
      {
        ...methods,
        focus: (options?: InputFocusOption) => inputRef.value?.focus(options),
        blur: () => inputRef.value?.blur(),
      },
      refLikeToDescriptors({
        input: inputRef,
        popover: popoverRef,
      }),
    );
    const [stateClass] = useCEStates(() => null, ns, editComputed);

    const { render, loading, options, renderOptions, renderOption } = useOptions(props, 'select-option', {
      groupOptionName: 'select-optgroup',
      context: context.provided,
      contextName: 'selectContext',
    });

    const contentOnPointerDown = () => {
      raf(() => {
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

    const inputValue = useTempState(() => (!props.multiple && customTagProps(valueModel.value).label) || ''); // all falsy value to empty string, to prevent inputValue reset
    const createdOptions = ref([] as CommonOption[]);
    const extra = computed(() => {
      // any more efficient way to do this?
      const { value } = inputValue;
      const { freeInput, multiple } = props;
      // it's complicated to preview creating options when it's multiple, so disable it
      const hasCreatingOption = freeInput && value && !multiple;
      let allHidden = !hasCreatingOption,
        hasLabelSameAsInput = false;
      for (let index = hasCreatingOption ? 1 : 0; index < context.value.length; index++) {
        const i = context.value[index];
        const hidden = i.exposed?.hidden;
        if (!hidden) allHidden = false;
        if (hasCreatingOption && value === i.props.label) {
          hasLabelSameAsInput = true;
        }
      }
      // allHidden will be affected by creating option, so put them in one computed
      return {
        allHidden,
        creatingOption:
          freeInput &&
          renderOption({
            label: value,
            value,
            hidden: !value || !inputValue.changedOnce || hasLabelSameAsInput || multiple,
            key: -1, // renderOption will use value as key by default, that will lead to rerender every time value changes
            onClick() {
              createdOptions.value.unshift(value);
            },
          }),
      };
    });
    const createdOptionsRender = computed(() => renderOptions(createdOptions.value));
    const popoverHandlers = {
      onAfterClose: () => {
        inputValue.reset();
      },
    };
    const popoverChildren = ({ isShow }: { isShow: boolean }) => {
      const { multiple, filter, freeInput } = props;
      const editable = editComputed.value.editable && (filter || freeInput);
      return renderElement(
        'input',
        {
          ...attrs,
          ...themeProps.value,
          ...activateHandlers,
          ref: inputRef,
          multiple,
          readonly: !editable,
          value: multiple ? valueModel.value : inputValue.value,
          unique: true,
          onInput() {
            const pop = popoverRef.value;
            if (!pop?.isOpen) pop.openPopover();
          },
          onUpdate: (e: CustomEvent) => {
            const value = e.detail;
            if (!multiple) {
              inputValue.value = value;
              // if it's not multiple, unselect current when input is cleared
              if (value == null) methods.unselectAll();
              if (freeInput)
                nextTick(() => {
                  activateMethods.deactivate();
                  activateMethods.activateNext();
                }); // make the current creating option active
              emit('inputUpdate', value);
            } else valueModel.value = value;
          },
          onTagsComposing(e: CustomEvent) {
            inputValue.value = e.detail;
            emit('inputUpdate', e.detail);
          },
          onEnterDown() {
            const { value } = inputValue;
            const activeChild = activateMethods.getActiveChild();
            methods.toggle(activeChild?.props.value);
            if (!multiple && freeInput && value && inputValue.changed) {
              const child = valueToChild(value);
              if (child !== context.value[0]) return;
              methods.select(value);
              createdOptions.value.unshift(value);
              inputValue.reset();
              nextTick(activateMethods.activateCurrentSelected);
            }
          },
          onTagsAdd(e: CustomEvent<string[]>) {
            const newOptions = e.detail.map((i) => ({ label: i, value: i }));
            methods.select(...e.detail);
            createdOptions.value.unshift(...newOptions);
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
      const isTeleport = props.type === 'teleport';
      const popContent = (
        <div class={ns.e('content')} part="content" slot="pop-content" onPointerdown={contentOnPointerDown}>
          {!context.value.length && !options.value?.length ? (
            <slot name="no-content">No content</slot> // TODO emptyText prop
          ) : (
            <>
              {buttons.value}
              {extra.value.allHidden && <slot name="no-content">No content</slot>}
              {extra.value.creatingOption}
              {createdOptionsRender.value}
              {render.value}
              {/* slot for select children, also assigned to popover content slot */}
              <slot></slot>
            </>
          )}
        </div>
      );
      return renderElement(
        'popover',
        {
          ...mergeProps(pick(props, objectKeys(selectPropsOfPopover)), popoverHandlers),
          ...themeProps.value,
          rootClass: [ns.is('select'), ns.s()],
          open: editComputed.value.editable ? undefined : false,
          class: stateClass.value,
          triggers: ['click', 'focus'],
          sync: 'width',
          showArrow: false,
          ref: popoverRef,
          toggleMode: true,
          useTransform: false,
          placement: 'bottom-start',
          defaultChildren: popoverChildren,
          contentType: 'vnode',
          // if type is teleport, pop content node must be rendered inside popover, or it can not be teleported
          // if type is not teleport, pop content node must be rendered as popover children, so that select styles about select-content can work
          content: isTeleport && popContent,
        },
        // do not use <>...</> here, it will cause popover default slot not work, as Fragment will render as comment, comment node will also override popover default slot content
        isTeleport ? undefined : popContent,
      );
    };
  },
});

export type tSelect = typeof Select;
export type iSelect = InstanceType<tSelect> &
  ReturnType<typeof useSelectMethods> & {
    blur: () => void;
    focus: (option?: InputFocusOption) => void;
    readonly input: iInput;
    readonly popover: iPopover;
  };

export const defineSelect = createDefineElement('select', Select, {
  'select-option': defineSelectOption,
  'select-optgroup': defineSelectOptgroup,
  popover: definePopover,
  input: defineInput,
  spin: defineSpin,
  button: defineButton,
});
