/**
 * 用类似str + { prefix, value, displayLen, actualLen, append, prepend }的数组存
 * 记录cursorIndexInTotal cursorIndexInArr
 */
import { computed, nextTick, ref, watchEffect } from 'vue';
import { useSetupEdit, refLikesToGetters, useInput, useInputElement, useMentions } from '@lun/core';
import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import {
  useCEExpose,
  useCEStates,
  useNamespace,
  usePropsFromFormItem,
  useSetupContextEvent,
  useValueModel,
} from 'hooks';
import { getHeight, isEmpty, supportsPlaintextEditable } from '@lun/utils';
import { defineIcon } from '../icon/Icon';
import { InputFocusOption } from 'common';
import { mentionsEmits, mentionsProps } from './type';
import { definePopover } from '../popover';

const name = 'mentions';
export const Mentions = defineSSRCustomElement({
  name,
  formAssociated: true,
  props: mentionsProps,
  emits: mentionsEmits,
  setup(props, { emit, attrs }) {
    useSetupContextEvent();
    const ns = useNamespace(name);
    const valueModel = useValueModel(props);
    const { validateProps } = usePropsFromFormItem(props);
    const [editComputed] = useSetupEdit();
    const textareaRef = ref<HTMLTextAreaElement>();
    const endRange = ref<Range>();

    let maxHeight: number;
    const adjustHeight = (el?: HTMLTextAreaElement) => {
      if (!el) return;
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
      const textarea = textareaRef.value;
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

    const { handlers, editRef, render, state } = useMentions(
      computed(() => {
        return {
          ...props,
          ...validateProps.value,
          disabled: !editComputed.value.editable,
          value: valueModel,
          onChange(val) {
            valueModel.value = val as string;
          },
          onEnterDown(e) {
            emit('enterDown', e);
          },
          onTrigger(param) {
            endRange.value = param.endRange;
            emit('trigger', param);
          },
        };
      }),
    );

    const extraHandlers = {
      onInput() {
        if (!props.autoRows) return;
        adjustHeight(textareaRef.value); // need to limit the width of contenteditable, besides, contenteditable support autoRows
      },
    };

    const clearValue = () => {
      valueModel.value = null as any;
    };

    const [stateClass, states] = useCEStates(
      () => ({
        empty: isEmpty(valueModel.value),
        required: validateProps.value.required,
        'with-clear-icon': props.showClearIcon && editComputed.value.editable,
      }),
      ns,
      editComputed,
    );

    const lengthInfo = computed(() => {
      const { maxLength, showLengthInfo } = props;
      if (!showLengthInfo) return;
      const valueLength = (valueModel.value ?? '').length;
      // if no maxLength, show current char count as length info
      return +maxLength! >= 0 ? (valueLength || '0') + '/' + maxLength : valueLength;
    });

    const rootOnPointerDown = () => {
      requestAnimationFrame(() => {
        if (editComputed.value.interactive) editRef.value?.focus();
      });
    };

    const clearIcon = computed(
      () =>
        states.value['with-clear-icon'] &&
        renderElement('icon', { name: 'x', class: [ns.e('clear-icon')], onClick: clearValue }),
    );

    const contenteditable = supportsPlaintextEditable() ? 'plaintext-only' : 'true';
    return () => {
      const { editable } = editComputed.value;
      const { placeholder, labelType, label, rows, cols } = props;
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
              part="textarea"
              class={ns.e('textarea')}
              placeholder={hasFloatLabel ? undefined : placeholder}
              rows={rows}
              cols={cols}
              style="visibility: hidden;"
            />
            <div
              {...attrs}
              ref={editRef}
              part="textarea"
              class={ns.e('textarea')}
              placeholder={hasFloatLabel ? undefined : placeholder}
              style={{
                resize: props.autoRows ? 'none' : props.resize,
              }}
              contenteditable={editable ? contenteditable : 'false'}
              {...handlers}
            >
              {render.value}
            </div>
            {clearIcon.value}
          </span>
          <div class={ns.e('length-info')} part="length-info">
            {lengthInfo.value}
          </div>
          {renderElement('popover', {
            showArrow: false,
            open: state.lastTrigger,
            content: 'test',
            target: endRange,
          })}
        </label>
      );
    };
  },
});

export type tMentions = typeof Mentions;
export type iMentions = InstanceType<tMentions> & {
  focus: (options?: InputFocusOption) => void;
  blur: () => void;
};

export const defineMentions = createDefineElement(name, Mentions, {
  icon: defineIcon,
  popover: definePopover,
});
