import { computed, nextTick, watchEffect } from 'vue';
import { useSetupEdit, refLikeToDescriptors, useInput, useInputElement, useSetupEvent } from '@lun/core';
import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { useCEExpose, useCEStates, useNamespace, usePropsFromFormItem, useValueModel } from 'hooks';
import { textareaEmits, textareaProps } from './type';
import { getHeight, isEmpty, raf } from '@lun/utils';
import { defineIcon } from '../icon/Icon';
import { InputFocusOption } from 'common';

const name = 'textarea';
export const Textarea = defineSSRCustomElement({
  name,
  props: textareaProps,
  formAssociated: true,
  emits: textareaEmits,
  setup(props, { emit: e, attrs }) {
    const ns = useNamespace(name);
    const emit = useSetupEvent<typeof e>();
    const valueModel = useValueModel(props);
    const { validateProps } = usePropsFromFormItem(props);
    const [editComputed] = useSetupEdit();
    const [textareaRef, methods] = useInputElement<HTMLTextAreaElement>();

    let maxHeight: number;
    const adjustHeight = (el: HTMLTextAreaElement) => {
      el.style.height = 'auto';
      el.style.minHeight = '';
      const minHeight = getHeight(el)!;
      if (maxHeight && minHeight > maxHeight) {
        el.style.height = maxHeight + 'px';
        // scroll to bottom
        if (el.selectionEnd && el.selectionEnd === el.value.length) el.scrollTop = el.scrollHeight;
      } else {
        el.style.minHeight = minHeight + 'px';
      }
    };
    watchEffect(() => {
      const { maxRows } = props;
      const textarea = textareaRef.value!;
      if (!maxRows || !textarea) return;
      // scrollHeight is not available when first mount
      nextTick(() => {
        textarea.rows = maxRows as number;
        const originalPlaceholder = textarea.placeholder;
        textarea.placeholder = '';
        // placeholder can affect scrollHeight, so we need to clear it first
        maxHeight = getHeight(textarea)!;
        textarea.rows = props.rows as number;
        textarea.placeholder = originalPlaceholder;
        adjustHeight(textarea); // there may be a long placeholder, we need to adjust height
      });
    });

    const { handlers } = useInput(
      computed(() => {
        return {
          ...props,
          ...validateProps.value,
          disabled: !editComputed.editable,
          value: valueModel,
          onChange(val) {
            valueModel.value = val as string;
          },
          onEnterDown(e) {
            emit('enterDown', e);
          },
        };
      }),
      {
        onInput(e) {
          if (!props.autoRows) return;
          adjustHeight(e.target as HTMLTextAreaElement);
        },
      },
    );

    const clearValue = () => {
      valueModel.value = null as any;
    };

    useCEExpose(methods, refLikeToDescriptors({ textarea: textareaRef }));

    const [stateClass, states] = useCEStates(
      () => ({
        empty: isEmpty(valueModel.value),
        required: validateProps.value.required,
        withClearIcon: props.showClearIcon && editComputed.editable,
      }),
      ns,
    );

    const lengthInfo = computed(() => {
      const { maxLength, showLengthInfo } = props;
      if (!showLengthInfo) return;
      const valueLength = (valueModel.value ?? '').length;
      // if no maxLength, show current char count as length info
      return +maxLength! >= 0 ? (valueLength || '0') + '/' + maxLength : valueLength;
    });

    const rootOnPointerDown = () => {
      raf(() => {
        if (editComputed.interactive) textareaRef.value?.focus();
      });
    };

    const clearIcon = computed(
      () =>
        states.withClearIcon &&
        renderElement('icon', { name: 'x', class: [ns.e('clear-icon')], onClick: clearValue }),
    );

    return () => {
      const { disabled, readonly } = editComputed;
      const { placeholder, labelType, label, rows, cols, spellcheck } = props;
      const floatLabel = label || placeholder;
      const hasFloatLabel = labelType === 'float' && floatLabel;
      return (
        <label part="root" class={stateClass.value} onPointerdown={rootOnPointerDown}>
          {hasFloatLabel && (
            <div class={[ns.e('label'), ns.is('float-label')]} part="float-label">
              {floatLabel}
              <div class={ns.em('label', 'float-background')}>{floatLabel}</div>
            </div>
          )}
          <span class={ns.e('wrapper')} part="wrapper">
            <textarea
              {...attrs}
              spellcheck={spellcheck}
              ref={textareaRef}
              part="textarea"
              class={ns.e('textarea')}
              value={valueModel.value}
              placeholder={hasFloatLabel ? undefined : placeholder}
              disabled={disabled}
              readonly={readonly}
              rows={rows}
              cols={cols}
              style={{
                resize: props.autoRows ? 'none' : props.resize,
              }}
              {...handlers}
            />
            {clearIcon.value}
          </span>
          <div class={ns.e('length-info')} part="length-info">
            {lengthInfo.value}
          </div>
        </label>
      );
    };
  },
});

export type tTextarea = typeof Textarea;
export type iTextarea = InstanceType<tTextarea> & {
  focus: (options?: InputFocusOption) => void;
  blur: () => void;
  readonly textarea: HTMLTextAreaElement;
};

export const defineTextarea = createDefineElement(name, Textarea, {
  icon: defineIcon,
});
