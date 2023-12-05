import { computed, ref } from 'vue';
import { useSetupEdit, useMultipleInput } from '@lun/core';
import { defineSSRCustomFormElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { useCEExpose, useNamespace, useVModelCompatible, useValueModel } from 'hooks';
import { inputProps } from './type';
import { isEmpty, isArray } from '@lun/utils';
import { VCustomRenderer } from '../custom-renderer/CustomRenderer';
import { defineIcon } from '../icon/Icon';
import { defineTag } from '../tag/Tag';

const name = 'input';
export const Input = defineSSRCustomFormElement({
  name,
  props: inputProps,
  inheritAttrs: false,
  emits: ['update', 'enterDown'],
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
      }))
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
          type={props.type}
          ref={inputRef}
          part={ns.p('inner-input')}
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
          part={ns.p('root')}
          class={[
            ns.s(editComputed),
            ns.is(empty ? 'empty' : 'not-empty'),
            ns.is(editable ? 'editable' : 'not-editable'),
            ns.is('multiple', multiple),
          ]}
        >
          <div class={[ns.e('slot'), ns.b('addon-before')]} part={ns.p('addon-before')}>
            <slot name="addon-before"></slot>
          </div>
          <label class={ns.e('label')} part={ns.p('label')}>
            {hasFloatLabel && (
              <div class={[ns.e('label'), ns.is('float-label')]} part={ns.p('float-label')}>
                {floatLabel}
                <div class={ns.em('label', 'float-background')}>{floatLabel}</div>
              </div>
            )}
            <div class={[ns.e('slot'), ns.e('prefix')]} part={ns.p('prefix')}>
              <slot name="prefix"></slot>
            </div>
            <span style="position: relative">
              {/* render when value is defined，in case it covers float label and placeholder */}
              {!empty && (
                <div class={[ns.e('inner-input'), ns.e('custom-renderer')]}>
                  <slot name="renderer"></slot>
                </div>
              )}
              {multiple ? (
                <span {...wrapperHandlers} class={[ns.e('tag-container')]} part={ns.p('tag-container')}>
                  {isArray(valueModel.value) &&
                    valueModel.value.map((v, index) => {
                      const tagProps = {
                        tabindex: editable ? 0 : undefined,
                        'data-tag-index': index,
                        'data-tag-value': v,
                        key: String(v),
                        class: [ns.e('tag')],
                      };
                      if (props.tagRenderer)
                        return (
                          <VCustomRenderer
                            {...tagProps}
                            type={props.tagRendererType}
                            content={props.tagRenderer(v, index)}
                          />
                        );
                      return renderElement(
                        'tag',
                        {
                          ...tagProps,
                          removable: editable,
                          onAfterRemove: () => (valueModel.value as string[]).splice(index, 1),
                        },
                        v
                      );
                    })}
                  {input}
                </span>
              ) : (
                input
              )}
            </span>
            <span class={ns.e('background')} part={ns.p('background')} />
            <span
              class={[ns.e('slot'), ns.e('suffix'), props.showClearIcon && ns.is('with-clear')]}
              part={ns.p('suffix')}
            >
              {getClearIcon()}
              <slot name="suffix">
                {/* this is static position clear icon, used to occupy place */}
                {getClearIcon()}
              </slot>
            </span>
            {props.showLengthInfo && <span class={ns.e('length-info')}>{lengthInfo.value}</span>}
          </label>
          <div class={[ns.e('slot'), ns.b('addon-after')]} part={ns.p('addon-after')}>
            <slot name="addon-after"></slot>
          </div>
        </span>
      );
    };
  },
});

declare module 'vue' {
  export interface GlobalComponents {
    LInput: typeof Input;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-input': typeof Input;
  }
}

export const defineInput = createDefineElement(name, Input, {
  icon: defineIcon,
  tag: defineTag,
});
