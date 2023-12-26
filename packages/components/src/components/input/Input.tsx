import { computed, ref, mergeProps } from 'vue';
import { useSetupEdit, useMultipleInput } from '@lun/core';
import { defineSSRCustomFormElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { useCEExpose, useNamespace, useSlot, useVModelCompatible, useValueModel } from 'hooks';
import { inputEmits, inputProps } from './type';
import { isEmpty, isArray, runIfFn } from '@lun/utils';
import { VCustomRenderer } from '../custom-renderer/CustomRenderer';
import { defineIcon } from '../icon/Icon';
import { defineTag } from '../tag/Tag';
import { pickThemeProps } from 'common';

const name = 'input';
export const Input = defineSSRCustomFormElement({
  name,
  props: inputProps,
  inheritAttrs: false,
  emits: inputEmits,
  setup(props, { emit, attrs }) {
    const ns = useNamespace(name);
    const valueModel = useValueModel(props);
    const [updateVModel] = useVModelCompatible();
    const [editComputed] = useSetupEdit();
    const inputRef = ref<HTMLInputElement>();
    const valueForMultiple = ref(''); // used to store the value when it's multiple input

    const { inputHandlers, wrapperHandlers } = useMultipleInput(
      computed(() => ({
        ...props,
        value: valueModel.value,
        onChange: (val) => {
          updateVModel(val);
          valueModel.value = val;
        },
        onInputUpdate(val) {
          valueForMultiple.value = val;
        },
        onEnterDown(e) {
          emit('enterDown', e);
        },
      })),
    );
    const clearValue = () => {
      if (props.multiple) {
        valueModel.value = [];
        valueForMultiple.value = '';
      } else valueModel.value = null;
    };

    useCEExpose({
      focus: (options?: { preventScroll?: boolean; cursor?: 'start' | 'end' | 'all' }) => {
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
    });

    const getClearIcon = () =>
      props.showClearIcon &&
      editComputed.value.editable &&
      renderElement('icon', { name: 'x', class: [ns.em('suffix', 'clear-icon')], onClick: clearValue });

    const lengthInfo = computed(() => {
      const valueLength = props.multiple ? valueForMultiple.value.length : valueModel.value?.length;
      // if no maxLength, show current char count as length info
      return props.maxLength! >= 0 ? (valueLength || '0') + '/' + props.maxLength : valueLength;
    });

    const prependSlot = useSlot({ name: 'prepend' });
    const prefixSlot = useSlot({ name: 'prefix' });
    const suffixSlot = useSlot({ name: 'suffix' });
    const appendSlot = useSlot({ name: 'append' });

    return () => {
      const { disabled, readonly, editable } = editComputed.value;
      const { multiple, placeholder, labelType, label } = props;
      const floatLabel = label || placeholder;
      const hasFloatLabel = labelType === 'float' && floatLabel;
      const empty = isEmpty(valueModel.value) && !valueForMultiple.value;
      const hidePlaceholderForMultiple = multiple && !empty;
      const input = (
        <input
          {...attrs}
          exportparts=""
          type={props.type}
          ref={inputRef}
          part="inner-input"
          class={[ns.e('inner-input')]}
          value={multiple ? valueForMultiple.value : valueModel.value}
          placeholder={hasFloatLabel || hidePlaceholderForMultiple ? undefined : placeholder}
          disabled={disabled}
          readonly={readonly}
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
              'with-prepend': !prependSlot.empty.value,
              'with-append': !appendSlot.empty.value,
            }),
          ]}
        >
          <div
            class={[ns.e('slot'), ns.e('prepend'), ns.e('addon'), ns.isN('empty', prependSlot.empty.value)]}
            part="prepend"
          >
            <slot {...prependSlot.slotProps}></slot>
          </div>
          <label class={ns.e('label')} part="label">
            {hasFloatLabel && (
              <div class={[ns.e('label'), ns.is('float-label')]} part="float-label">
                {floatLabel}
                <div class={ns.em('label', 'float-background')}>{floatLabel}</div>
              </div>
            )}
            <div class={[ns.e('slot'), ns.e('prefix'), ns.isN('empty', prefixSlot.empty.value)]} part="prefix">
              <slot {...prefixSlot.slotProps}></slot>
            </div>
            <span style="position: relative" part="wrapper">
              {/* render when value is defined，in case it covers float label and placeholder */}
              {!empty && (
                <div class={[ns.e('inner-input'), ns.e('custom-renderer')]}>
                  <slot name="renderer"></slot>
                </div>
              )}
              {multiple ? (
                <span {...wrapperHandlers} class={[ns.e('tag-container')]} part="tag-container">
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
                ns.isN('empty', suffixSlot.empty.value),
              ]}
              part="suffix"
            >
              {getClearIcon()}
              <slot {...suffixSlot.slotProps}>
                {/* this is static position clear icon, used to occupy place */}
                {getClearIcon()}
              </slot>
            </span>
            {props.showLengthInfo && (
              <span class={ns.e('length-info')} part="length-info">
                {lengthInfo.value}
              </span>
            )}
          </label>
          <div
            class={[ns.e('slot'), ns.e('append'), ns.e('addon'), ns.isN('empty', appendSlot.empty.value)]}
            part="append"
          >
            <slot {...appendSlot.slotProps}></slot>
          </div>
        </span>
      );
    };
  },
});

export type tInput = typeof Input;

export const defineInput = createDefineElement(name, Input, {
  icon: defineIcon,
  tag: defineTag,
});
