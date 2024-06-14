import { computed, ref, watchEffect } from 'vue';
import { useSetupEdit, useMentions, VirtualElement, MentionSpan, MentionsTriggerParam, useSetupEvent } from '@lun/core';
import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { useCEStates, useNamespace, useOptions, usePropsFromFormItem, useValueModel } from 'hooks';
import { isEmpty, isSupportPlaintextEditable, raf, virtualGetMerge } from '@lun/utils';
import { defineIcon } from '../icon/Icon';
import { InputFocusOption } from 'common';
import { mentionsEmits, mentionsProps } from './type';
import { definePopover } from '../popover';
import { defineSelectOption } from '../select';
import { useSelect } from '../select/useSelect';
import { VCustomRenderer } from '../custom-renderer';

const name = 'mentions';
export const Mentions = defineSSRCustomElement({
  name,
  formAssociated: true,
  props: mentionsProps,
  emits: mentionsEmits,
  setup(props, { emit: e, attrs }) {
    const emit = useSetupEvent<typeof e>();
    const ns = useNamespace(name);
    const valueModel = useValueModel(props, { shouldEmit: false });
    const { validateProps } = usePropsFromFormItem(props);
    const [editComputed] = useSetupEdit();
    const target = ref<VirtualElement>();
    const lastTriggerInput = ref<string>();

    const selected = ref<string>();
    const { context, activateHandlers, activateMethods, valueToLabel } = useSelect(
      {
        get upDownToggle() {
          return !!state.lastTrigger;
        },
        autoActivateFirst: true,
      },
      selected,
      {
        onSingleSelect(value) {
          commit(value, valueToLabel(value));
        },
      },
    );

    const { handlers, editRef, render, state, commit } = useMentions(
      virtualGetMerge(
        {
          value: valueModel,
          valueToLabel,
          get disabled() {
            return !editComputed.editable;
          },
          onChange({ value, raw }: { value: string; raw: readonly (string | MentionSpan)[] }) {
            if (value !== valueModel.value) {
              valueModel.value = value;
              emit('update', value);
            }
            emit('updateRaw', raw);
          },
          onEnterDown(e: KeyboardEvent) {
            emit('enterDown', e);
          },
          onTrigger(param: MentionsTriggerParam) {
            const { endRange, input } = param;
            const rect = endRange.getBoundingClientRect();
            // get the rect immediately to fix a bug. found that in safari if use the range as popover target, the position would be incorrect
            // seems that the range endContainer is updated to span, not the text node, and at that time the rect is incorrect for unknown reason
            target.value = {
              getBoundingClientRect: () => rect,
            };
            lastTriggerInput.value = input;
            emit('trigger', param);
          },
          onCommit() {
            const child = activateMethods.getActiveChild();
            if (child) {
              return [child.props.value as string, child.props.label as string];
            } else return [props.noOptions ? lastTriggerInput.value : undefined];
          },
          get mentionRenderer() {
            const { mentionRenderer } = props;
            if (!mentionRenderer) return;
            else
              return (item: MentionSpan, necessaryProps: Record<string, any>) => (
                <VCustomRenderer content={mentionRenderer(item, necessaryProps)} />
              );
          },
        },
        props,
      ),
    );

    watchEffect(() => {
      selected.value = state.activeMentionValue;
      activateMethods.activateCurrentSelected();
    });

    const clearValue = () => {
      valueModel.value = null as any;
    };

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

    const popOnPointerDown = () => {
      state.ignoreNextBlur = true;
      raf(() => editRef.value!.focus());
    };

    const clearIcon = computed(
      () =>
        states.withClearIcon &&
        renderElement('icon', { name: 'x', class: [ns.e('clear-icon')], onClick: clearValue }),
    );

    const { render: optionsRender, hasOption } = useOptions(props, 'select-option', {
      mapOptionKey: () => state.lastTrigger,
    });

    const popoverProps = {
      showArrow: false,
      target,
      beforeOpen: activateMethods.initIndex,
    };

    const contenteditable = isSupportPlaintextEditable() ? 'plaintext-only' : 'true';
    return () => {
      const { editable, readonly } = editComputed;
      const { placeholder, labelType, label, rows, cols, noOptions, resize } = props;
      const floatLabel = label || placeholder;
      const hasFloatLabel = labelType === 'float' && floatLabel;
      return (
        <label part="root" class={stateClass.value}>
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
              tabindex={editable || readonly ? 0 : undefined}
              spellcheck={props.spellcheck}
              ref={editRef}
              part="textarea"
              class={ns.e('textarea')}
              placeholder={hasFloatLabel ? undefined : placeholder}
              style={{
                resize,
              }}
              contenteditable={editable ? contenteditable : 'false'}
              {...handlers}
              {...activateHandlers}
            >
              {render.value}
            </div>
            {clearIcon.value}
          </span>
          <div class={ns.e('length-info')} part="length-info">
            {lengthInfo.value}
          </div>
          {renderElement(
            'popover',
            {
              ...popoverProps,
              open: !!state.lastTrigger && !noOptions,
            },
            <div class={ns.e('content')} part="content" slot="pop-content" onPointerdown={popOnPointerDown}>
              {!context.value.length && !hasOption() ? (
                <slot name="no-content">No content</slot> // TODO emptyText prop
              ) : (
                [optionsRender.value, <slot></slot>]
              )}
            </div>,
          )}
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
  'select-option': defineSelectOption,
});
