import { computed, ref } from 'vue';
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
import { textareaEmits, textareaProps } from './type';
import { isEmpty} from '@lun/utils';
import { defineIcon } from '../icon/Icon';
import { InputFocusOption } from 'common';

const name = 'textarea';
export const Textarea = defineSSRCustomElement({
  name,
  props: textareaProps,
  formAssociated: true,
  emits: textareaEmits,
  setup(props, { emit }) {
    const ns = useNamespace(name);
    const valueModel = useValueModel(props);
    const { validateProps } = usePropsFromFormItem(props);
    const [editComputed] = useSetupEdit();
    useSetupContextEvent();
    const [textareaRef, methods] = useInputElement<HTMLTextAreaElement>();

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
    );

    const clearValue = () => {
      valueModel.value = null as any;
    };

    useCEExpose(methods, refLikesToGetters({ textarea: textareaRef }));

    const [stateClass, states] = useCEStates(
      () => ({
        empty: isEmpty(valueModel.value),
        required: validateProps.value.required,
      }),
      ns,
      editComputed,
    );

    const lengthInfo = computed(() => {
      const { maxLength, showLengthInfo } = props;
      if (!showLengthInfo) return;
      const valueLength = String(valueModel.value ?? '').length;
      // if no maxLength, show current char count as length info
      return +maxLength! >= 0 ? (valueLength || '0') + '/' + maxLength : valueLength;
    });

    const rootOnPointerDown = () => {
      requestAnimationFrame(() => {
        if (editComputed.value.interactive) textareaRef.value?.focus();
      });
    };

    const clearIcon = computed(
      () =>
        props.showClearIcon &&
        editComputed.value.editable &&
        renderElement('icon', { name: 'x', class: [ns.em('suffix', 'clear-icon')], onClick: clearValue }),
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
          <textarea
            ref={textareaRef}
            part="textarea"
            class={[ns.e('textarea')]}
            value={valueModel.value}
            placeholder={hasFloatLabel ? undefined : placeholder}
            disabled={disabled}
            readonly={readonly}
            {...handlers}
          />
          {lengthInfo.value}
          {clearIcon.value}
          <span class={ns.e('background')} part="background" />
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
