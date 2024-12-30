import { defineCustomElement } from 'custom';
import { computed, ref, mergeProps, nextTick } from 'vue';
import { closePopover, createDefineElement, openPopover, renderElement } from 'utils';
import { selectEmits, selectProps, selectPropsOfPopover } from './type';
import { definePopover, iPopover } from '../popover/Popover';
import { refLikeToDescriptors, UseSelectMethods, useSetupEdit, useTempState } from '@lun-web/core';
import { isFunction, isNilOrEmptyStr, objectKeys, pick, raf } from '@lun-web/utils';
import { defineInput, iInput } from '../input/Input';
import { defineSelectOption } from './SelectOption';
import { defineSelectOptgroup } from './SelectOptgroup';
import {
  CommonOption,
  getAllThemeValues,
  useCEExpose,
  useCEStates,
  useNamespace,
  useOptions,
  useValueModel,
} from 'hooks';
import { getCompParts, InputFocusOption, intl, pickThemeProps } from 'common';
import { defineSpin } from '../spin/Spin';
import { defineButton } from '../button/Button';
import { useSelect } from './useSelect';

const name = 'select';
const parts = ['content'] as const;
const compParts = getCompParts(name, parts);
export const Select = defineCustomElement({
  name,
  props: selectProps,
  formAssociated: true,
  emits: selectEmits,
  setup(props, { emit, attrs }) {
    const ns = useNamespace(name);
    const [editComputed] = useSetupEdit();
    const valueModel = useValueModel(props, {
      hasRaw: true,
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
        if (props.autoClose && !isNilOrEmptyStr(value)) closePopover(popoverRef, true);
      },
    });

    const customTagProps = (value: any) => {
      const child = valueToChild(value);
      return {
        ...(child ? getAllThemeValues(child) : themeProps.value),
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
    const [stateClass] = useCEStates(() => null);

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

    const inputValue = useTempState(() => (!props.multiple && customTagProps(valueModel.value.value).label) || ''); // all falsy value to empty string, to prevent inputValue reset
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
      const { multiple, filter, freeInput, hideOptionWhenSelected } = props;
      const editable = editComputed.editable && (filter || freeInput || hideOptionWhenSelected);
      return renderElement(
        'input',
        {
          ...attrs,
          ...themeProps.value,
          ...activateHandlers,
          ref: inputRef,
          multiple,
          readonly: !editable,
          value: multiple ? valueModel.value.value : inputValue.value,
          unique: true,
          onInput() {
            const pop = popoverRef.value;
            if (!pop?.isOpen) openPopover(popoverRef);
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
            } else
              valueModel.value = {
                value,
                raw: new Set(value),
              };
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

    const getNoContent = () => (
      <slot name="no-content">
        <div class={ns.e('empty')}>
          {renderElement('icon', { name: 'warning', class: ns.em('empty', 'icon') })}
          <span class={ns.em('empty', 'text')}>{intl('select.noContent').d('No content')}</span>
        </div>
      </slot>
    );
    return () => {
      const isTeleport = props.type === 'teleport';
      const popContent = (
        <div class={ns.e('content')} part={compParts[0]} slot="pop-content" onPointerdown={contentOnPointerDown}>
          {!context.value.length && !options.value?.length ? (
            getNoContent()
          ) : (
            <>
              {buttons.value}
              {extra.value.allHidden && getNoContent()}
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
          open: editComputed.editable ? undefined : false,
          class: stateClass.value,
          triggers: ['click', 'focus'],
          popWidth: 'anchorWidth',
          showArrow: false,
          ref: popoverRef,
          toggleMode: true,
          useTransform: false,
          placement: 'bottom-start',
          defaultChildren: popoverChildren,
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
export type SelectExpose = UseSelectMethods & {
  blur: () => void;
  focus: (option?: InputFocusOption) => void;
  readonly input: iInput;
  readonly popover: iPopover;
};
export type iSelect = InstanceType<tSelect> & SelectExpose;

export const defineSelect = createDefineElement(
  'select',
  Select,
  {
    autoClose: true,
    upDownToggle: true,
    autoActivateFirst: true,
  },
  parts,
  {
    'select-option': defineSelectOption,
    'select-optgroup': defineSelectOptgroup,
    popover: definePopover,
    input: defineInput,
    spin: defineSpin,
    button: defineButton,
  },
);
