import { computed, ref, mergeProps } from 'vue';
import { useSetupEdit, useMultipleInput, refLikeToDescriptors, useInputElement } from '@lun/core';
import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import {
  useCEExpose,
  useCEStates,
  useNamespace,
  usePropsFromFormItem,
  useSetupContextEvent,
  useSlot,
  useValueModel,
} from 'hooks';
import { inputEmits, inputProps } from './type';
import { isEmpty, isArray, runIfFn, virtualGetMerge } from '@lun/utils';
import { VCustomRenderer } from '../custom-renderer/CustomRenderer';
import { defineIcon } from '../icon/Icon';
import { defineTag } from '../tag/Tag';
import { InputFocusOption, pickThemeProps, renderStatusIcon } from 'common';
import { GlobalStaticConfig } from 'config';

const name = 'input';
export const Input = defineSSRCustomElement({
  name,
  props: inputProps,
  formAssociated: true,
  emits: inputEmits,
  setup(props, { emit }) {
    const ns = useNamespace(name);
    const valueModel = useValueModel(props);
    // when type=number, valueModel is a number, but we need to avoid update input's value when it's '1.'
    const strValModel = ref('');
    const { status, validateProps } = usePropsFromFormItem(props);
    const [editComputed] = useSetupEdit();
    useSetupContextEvent();
    const [inputRef, methods] = useInputElement<HTMLInputElement>();
    const valueForMultiple = ref(''); // used to store the value when it's multiple input

    const { inputHandlers, wrapperHandlers, numberMethods, nextStepHandlers, prevStepHandlers, state } =
      useMultipleInput(
        // it was computed, but spread props will make it re-compute every time the value changes, so use virtualGetMerge instead
        virtualGetMerge(
          {
            value: valueModel,
            get disabled() {
              return !editComputed.value.editable;
            },
            onChange(val: string | number | string[] | number[], targetVal?: string) {
              valueModel.value = val;
              targetVal != null && (strValModel.value = targetVal);
            },
            onInputUpdate(val: string | number) {
              // MUST return when it's not multiple, seems that updating valueForMultiple will make input rerender
              // and that will cause input composition issue when input is empty
              if (!props.multiple) return;
              valueForMultiple.value = val ? String(val) : '';
              emit('tagsComposing', val);
            },
            onEnterDown(e: KeyboardEvent) {
              emit('enterDown', e);
            },
            onTagsAdd(addedTags: string[]) {
              emit('tagsAdd', addedTags);
            },
            onTagsRemove(removedTags: string[]) {
              emit('tagsRemove', removedTags);
            },
          },
          validateProps.value,
          props,
        ),
      );

    const finalInputVal = computed(() => {
      if (props.multiple) return valueForMultiple.value;
      const { type } = validateProps.value;
      const { value } = valueModel,
        str = strValModel.value;
      // +value === +str is to avoid input rerender when input is '1.' and type is number
      // but we need to return valueModel to update the input if it's not focusing
      // because when we input '1.', actual input value is '1', and it doesn't trigger change event after blur, so normalizeNumber won't happen in useInput
      if (type === 'number' && str && +value! === +str && state.focusing) return str;
      else return value;
    });

    const clearValue = () => {
      if (props.multiple) {
        valueModel.value = [];
        valueForMultiple.value = '';
        emit('tagsComposing', '');
        emit('tagsRemove', []);
      } else valueModel.value = null;
    };

    useCEExpose(
      {
        ...methods,
        ...numberMethods,
        get valueAsNumber() {
          return GlobalStaticConfig.math.toRawNum(valueModel.value);
        },
      },
      refLikeToDescriptors({ input: inputRef }),
    );

    const [stateClass, states] = useCEStates(
      () => ({
        empty: isEmpty(valueModel.value) && !valueForMultiple.value,
        multiple: props.multiple,
        required: validateProps.value.required,
        'with-prepend': !prependSlot.empty.value,
        'with-append': !appendSlot.empty.value,
        'with-renderer': !rendererSlot.empty.value,
      }),
      ns,
      editComputed,
    );

    const lengthInfo = computed(() => {
      const valueLength = props.multiple ? valueForMultiple.value.length : String(valueModel.value ?? '').length;
      // if no maxLength, show current char count as length info
      return +props.maxLength! >= 0 ? (valueLength || '0') + '/' + props.maxLength : valueLength;
    });

    const numberStepIcons = computed(() => {
      const { stepControl, multiple } = props;
      const { type } = validateProps.value;
      if ((type !== 'number' && type !== 'number-string') || multiple) return;
      const step = ns.e('step'),
        arrow = ns.e('arrow'),
        slot = ns.e('slot');
      return {
        arrow: stepControl === 'up-down' && (
          <span class={ns.e('steps-wrapper')} part="steps-wrapper">
            {renderElement('icon', { class: [step, arrow], name: 'up', part: 'up', ...nextStepHandlers })}
            {renderElement('icon', { class: [step, arrow], name: 'down', part: 'down', ...prevStepHandlers })}
          </span>
        ),
        plus: stepControl === 'plus-minus' && (
          <div class={[slot, ns.e('plus')]}>
            {renderElement('icon', { class: step, name: 'plus', part: 'plus', ...nextStepHandlers })}
          </div>
        ),
        minus: stepControl === 'plus-minus' && (
          <div class={[slot, ns.e('minus')]}>
            {renderElement('icon', { class: step, name: 'minus', part: 'minus', ...prevStepHandlers })}
          </div>
        ),
      };
    });

    const rootOnPointerDown = () => {
      // input will gain focus after we click anything inside label, but it's not immediate. We need to focus the input to show focus styles as soon as possible
      requestAnimationFrame(() => {
        if (editComputed.value.interactive) inputRef.value?.focus();
      });
    };

    const prependSlot = useSlot({ name: 'prepend' });
    const prefixSlot = useSlot({ name: 'prefix' });
    const suffixSlot = useSlot({ name: 'suffix' });
    const appendSlot = useSlot({ name: 'append' });
    const rendererSlot = useSlot({ name: 'renderer' });

    const clearIcon = computed(
      () =>
        props.showClearIcon &&
        editComputed.value.editable &&
        renderElement('icon', { name: 'x', class: [ns.em('suffix', 'clear-icon')], onClick: clearValue }),
    );

    const statusIcon = computed(() => {
      if (!props.showStatusIcon) return;
      return renderStatusIcon(status.value);
    });

    return () => {
      const { disabled, readonly, editable } = editComputed.value;
      const { multiple, placeholder, labelType, label, wrapTags, spellcheck, autofocus } = props;
      const { type } = validateProps.value;
      const inputType = type === 'number' ? type : 'text';
      const floatLabel = label || placeholder;
      const hasFloatLabel = labelType === 'float' && floatLabel;
      const { empty } = states.value;
      const hidePlaceholderForMultiple = multiple && !empty;
      const withPrepend = !prependSlot.empty.value;
      const withAppend = !appendSlot.empty.value;
      const input = (
        <input
          autofocus={autofocus}
          spellcheck={spellcheck}
          exportparts=""
          type={inputType}
          inputmode={type === 'number-string' ? 'numeric' : undefined}
          ref={inputRef}
          part="inner-input"
          class={[ns.e('inner-input')]}
          value={finalInputVal.value}
          placeholder={hasFloatLabel || hidePlaceholderForMultiple ? undefined : placeholder}
          disabled={disabled}
          readonly={readonly}
          size={hidePlaceholderForMultiple ? 1 : undefined}
          {...inputHandlers}
        />
      );
      return (
        <span part="root" class={[stateClass.value, ns.m(type)]} onPointerdown={rootOnPointerDown}>
          <div class={[ns.e('slot'), ns.e('prepend'), ns.e('addon'), ns.isOr('empty', !withPrepend)]} part="prepend">
            <slot {...prependSlot.slotProps}></slot>
          </div>
          <label class={ns.e('label')} part="label">
            {hasFloatLabel && (
              <div class={[ns.e('label'), ns.is('float-label')]} part="float-label">
                {floatLabel}
                <div class={ns.em('label', 'float-background')}>{floatLabel}</div>
              </div>
            )}
            {numberStepIcons.value?.minus}
            <div class={[ns.e('slot'), ns.e('prefix'), ns.isOr('empty', prefixSlot.empty.value)]} part="prefix">
              <slot {...prefixSlot.slotProps}></slot>
            </div>
            <span class={ns.e('wrapper')} part="wrapper">
              {/* render when value is defined，in case it covers float label and placeholder */}
              {/* TODO support custom renderer when multiple */}
              {!empty && !multiple && (
                <div class={[ns.e('inner-input'), ns.e('renderer')]} part="renderer">
                  <slot {...rendererSlot.slotProps}></slot>
                </div>
              )}
              {multiple ? (
                <span
                  {...wrapperHandlers}
                  class={[
                    ns.e('tag-container'),
                    ns.isOr(`wrap`, wrapTags),
                    ns.is('no-tags', isEmpty(valueModel.value)),
                  ]}
                  part="tag-container"
                >
                  {isArray(valueModel.value) &&
                    valueModel.value.map((v, index) => {
                      const tagProps = mergeProps(runIfFn(props.tagProps, v, index), {
                        tabindex: editable ? 0 : undefined,
                        'data-tag-index': index,
                        'data-tag-value': v,
                        key: String(v),
                        class: [ns.e('tag')],
                        onAfterRemove: () => (valueModel.value as string[]).splice(index, 1),
                      });
                      if (props.tagRenderer)
                        return (
                          <VCustomRenderer
                            {...tagProps}
                            type={props.tagRendererType}
                            content={props.tagRenderer(v, index)}
                          />
                        );
                      return renderElement('tag', {
                        label: v,
                        ...pickThemeProps(props),
                        ...tagProps,
                        removable: editable,
                      });
                    })}
                  {editable && (
                    // use grid and pseudo to make the input auto grow, see in https://css-tricks.com/auto-growing-inputs-textareas/
                    <span
                      class={ns.e('multi-input-wrapper')}
                      part="multi-input-wrapper"
                      data-value={hidePlaceholderForMultiple ? valueForMultiple.value : placeholder}
                    >
                      {input}
                    </span>
                  )}
                </span>
              ) : (
                input
              )}
            </span>
            <span class={ns.e('background')} part="background" />
            <span
              class={[
                ns.e('slot'),
                ns.e('suffix'),
                props.showClearIcon && ns.is('with-clear'),
                ns.isOr('empty', suffixSlot.empty.value && !clearIcon.value && !statusIcon.value),
              ]}
              part="suffix"
            >
              {clearIcon.value}
              <slot {...suffixSlot.slotProps}></slot>
              {statusIcon.value}
            </span>
            {props.showLengthInfo && (
              <span class={ns.e('length-info')} part="length-info">
                {lengthInfo.value}
              </span>
            )}
            {numberStepIcons.value?.plus}
            {numberStepIcons.value?.arrow}
          </label>
          <div class={[ns.e('slot'), ns.e('append'), ns.e('addon'), ns.isOr('empty', !withAppend)]} part="append">
            <slot {...appendSlot.slotProps}></slot>
          </div>
        </span>
      );
    };
  },
});

export type tInput = typeof Input;
export type iInput = InstanceType<tInput> & {
  focus: (options?: InputFocusOption) => void;
  blur: () => void;
  readonly input: HTMLInputElement;
};

export const defineInput = createDefineElement(name, Input, {
  icon: defineIcon,
  tag: defineTag,
});
