import { computed, ref, mergeProps } from 'vue';
import { useSetupEdit, useMultipleInput, refLikesToGetters } from '@lun/core';
import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { useCEExpose, useNamespace, usePropsFromFormItem, useSetupContextEvent, useSlot, useValueModel } from 'hooks';
import { inputEmits, inputProps } from './type';
import { isEmpty, isArray, runIfFn } from '@lun/utils';
import { VCustomRenderer } from '../custom-renderer/CustomRenderer';
import { defineIcon } from '../icon/Icon';
import { defineTag } from '../tag/Tag';
import { InputFocusOption, pickThemeProps } from 'common';
import { GlobalStaticConfig } from 'config';

const name = 'input';
export const Input = defineSSRCustomElement({
  name,
  props: inputProps,
  inheritAttrs: false,
  emits: inputEmits,
  setup(props, { emit, attrs }) {
    const ns = useNamespace(name);
    const valueModel = useValueModel(props);
    const { status, validateProps } = usePropsFromFormItem(props);
    const [editComputed] = useSetupEdit();
    useSetupContextEvent();
    const inputRef = ref<HTMLInputElement>();
    const valueForMultiple = ref(''); // used to store the value when it's multiple input

    const { inputHandlers, wrapperHandlers, numberMethods, nextStepHandlers, prevStepHandlers } = useMultipleInput(
      computed(() => {
        return {
          ...props,
          ...validateProps.value,
          disabled: !editComputed.value.editable,
          value: valueModel,
          onChange(val) {
            valueModel.value = val;
          },
          onInputUpdate(val) {
            // MUST return when it's not multiple, seems that updating valueForMultiple will make input rerender
            // and that will cause input composition issue when input is empty
            if (!props.multiple) return;
            valueForMultiple.value = val ? String(val) : '';
            emit('tagsComposing', val);
          },
          onEnterDown(e) {
            emit('enterDown', e);
          },
          onTagsAdd(addedTags) {
            emit('tagsAdd', addedTags);
          },
          onTagsRemove(removedTags) {
            emit('tagsRemove', removedTags);
          },
        };
      }),
    );

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
        focus: (options?: InputFocusOption) => {
          if (!inputRef.value) return;
          const input = inputRef.value;
          input.focus(options);
          const len = input.value.length;
          switch (options?.cursor) {
            case 'start':
              input.setSelectionRange(0, 0);
              break;
            case 'end':
              input.setSelectionRange(len, len);
              break;
            case 'all':
              input.select();
              break;
          }
        },
        blur: () => inputRef.value?.blur(),
        ...numberMethods,
        get valueAsNumber() {
          return GlobalStaticConfig.math.toNumber(valueModel.value);
        },
      },
      refLikesToGetters({ input: inputRef }),
    );

    const getClearIcon = () =>
      props.showClearIcon &&
      editComputed.value.editable &&
      renderElement('icon', { name: 'x', class: [ns.em('suffix', 'clear-icon')], onClick: clearValue });

    const lengthInfo = computed(() => {
      const valueLength = props.multiple ? valueForMultiple.value.length : String(valueModel.value ?? '').length;
      // if no maxLength, show current char count as length info
      return +props.maxLength! >= 0 ? (valueLength || '0') + '/' + props.maxLength : valueLength;
    });

    const numberStepIcons = computed(() => {
      const { stepControl } = props;
      const { type } = validateProps.value;
      if (type !== 'number' && type !== 'number-string') return;
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

    const statusIcon = computed(() => {
      if (!props.showStatusIcon) return;
      const { value } = status;
      if (value && ['success', 'error', 'warning'].includes(value))
        return renderElement('icon', { name: value, class: [ns.em('suffix', `${value}-icon`)] });
    });

    return () => {
      const { disabled, readonly, editable } = editComputed.value;
      const { multiple, placeholder, labelType, label, wrapTags } = props;
      const { type } = validateProps.value;
      const inputType = type === 'number' ? type : 'text';
      const floatLabel = label || placeholder;
      const hasFloatLabel = labelType === 'float' && floatLabel;
      const empty = isEmpty(valueModel.value) && !valueForMultiple.value;
      const hidePlaceholderForMultiple = multiple && !empty;
      const withPrepend = !prependSlot.empty.value;
      const withAppend = !appendSlot.empty.value;
      const input = (
        <input
          {...attrs}
          exportparts=""
          type={inputType}
          inputmode={type === 'number-string' ? 'numeric' : undefined}
          ref={inputRef}
          part="inner-input"
          class={[ns.e('inner-input')]}
          value={multiple ? valueForMultiple.value : valueModel.value}
          placeholder={hasFloatLabel || hidePlaceholderForMultiple ? undefined : placeholder}
          disabled={disabled}
          readonly={readonly}
          // FIXME size is not wide enough for chinese chars
          size={hidePlaceholderForMultiple ? valueForMultiple.value.length + 1 : undefined} // when it's multiple, width of input is determined by size
          {...inputHandlers}
        />
      );
      return (
        <span
          part="root"
          class={[
            ns.s(editComputed),
            ns.isN('empty', empty),
            ns.isN('editable', editable),
            ns.is({
              multiple,
              required: validateProps.value.required,
              'with-prepend': withPrepend,
              'with-append': withAppend,
              'with-renderer': !rendererSlot.empty.value,
            }),
            ns.m(type),
          ]}
          onPointerdown={rootOnPointerDown}
        >
          <div class={[ns.e('slot'), ns.e('prepend'), ns.e('addon'), ns.isN('empty', !withPrepend)]} part="prepend">
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
            <div class={[ns.e('slot'), ns.e('prefix'), ns.isN('empty', prefixSlot.empty.value)]} part="prefix">
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
                  class={[ns.e('tag-container'), ns.isN(`wrap`, wrapTags)]}
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
                  {input}
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
                ns.isN('empty', suffixSlot.empty.value && !props.showClearIcon && !props.showStatusIcon),
              ]}
              part="suffix"
            >
              {getClearIcon()}
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
          <div class={[ns.e('slot'), ns.e('append'), ns.e('addon'), ns.isN('empty', !withAppend)]} part="append">
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
