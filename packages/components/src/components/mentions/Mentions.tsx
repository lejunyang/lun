/**
 * 用类似str + { prefix, value, displayLen, actualLen, append, prepend }的数组存
 * 记录cursorIndexInTotal cursorIndexInArr
 */
import { computed, nextTick, watchEffect } from 'vue';
import { useSetupEdit, refLikesToGetters, useInput, useInputElement } from '@lun/core';
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
import { getHeight, isEmpty } from '@lun/utils';
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
    const [mentionsRef, methods] = useInputElement<HTMLTextAreaElement>();

    // let maxHeight: number;
    // const adjustHeight = (el: HTMLTextAreaElement) => {
    //   el.style.height = 'auto';
    //   el.style.minHeight = '';
    //   const minHeight = getHeight(el)!;
    //   if (maxHeight && minHeight > maxHeight) {
    //     el.style.height = maxHeight + 'px';
    //     // scroll to bottom
    //     if (el.selectionEnd && el.selectionEnd === el.value.length) el.scrollTop = el.scrollHeight;
    //   } else {
    //     el.style.minHeight = minHeight + 'px';
    //   }
    // };
    // watchEffect(() => {
    //   const { maxRows } = props;
    //   const mentions = mentionsRef.value!;
    //   if (!maxRows || !mentions) return;
    //   // scrollHeight is not available when first mount
    //   nextTick(() => {
    //     mentions.rows = maxRows as number;
    //     const originalPlaceholder = mentions.placeholder;
    //     mentions.placeholder = '';
    //     // placeholder can affect scrollHeight, so we need to clear it first
    //     maxHeight = getHeight(mentions)!;
    //     mentions.rows = props.rows as number;
    //     mentions.placeholder = originalPlaceholder;
    //     adjustHeight(mentions); // there may be a long placeholder, we need to adjust height
    //   });
    // });

    const { handlers } = useInput(
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
        };
      }),
      {
        onInput(e) {
          if (!props.autoRows) return;
          // adjustHeight(e.target as HTMLTextAreaElement);
        },
      },
    );

    /**
     * oninput notcomposing 获取光标位置，获取从头到光标的字符串，遍历triggers，检查是否有endWiths的项，有，弹出popover，div光标处插入tag元素，怎么插，分割文本节点？插入后光标移动至tag末尾
     */

    const clearValue = () => {
      valueModel.value = null as any;
    };

    useCEExpose(methods, refLikesToGetters({ mentions: mentionsRef }));

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
        if (editComputed.value.interactive) mentionsRef.value?.focus();
      });
    };

    const clearIcon = computed(
      () =>
        states.value['with-clear-icon'] &&
        renderElement('icon', { name: 'x', class: [ns.e('clear-icon')], onClick: clearValue }),
    );

    return () => {
      const { disabled, readonly } = editComputed.value;
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
            <div
              {...attrs}
              ref={mentionsRef}
              part="mentions"
              class={ns.e('mentions')}
              placeholder={hasFloatLabel ? undefined : placeholder}
              disabled={disabled}
              readonly={readonly}
              rows={rows}
              cols={cols}
              style={{
                resize: props.autoRows ? 'none' : props.resize,
              }}
              contenteditable="plaintext-only"
              {...handlers}
            ></div>
            {clearIcon.value}
          </span>
          <div class={ns.e('length-info')} part="length-info">
            {lengthInfo.value}
          </div>
          {renderElement('popover', {})}
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
