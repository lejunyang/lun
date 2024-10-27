import { computed, ref, watchEffect } from 'vue';
import { useSetupEdit, useMentions, VirtualElement, MentionSpan, MentionsTriggerParam, useSetupEvent } from '@lun-web/core';
import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { useCEStates, useNamespace, useOptions, usePropsFromFormItem, useValueModel } from 'hooks';
import { AnyFn, isEmpty, isSupportPlaintextEditable, raf, runIfFn, virtualGetMerge } from '@lun-web/utils';
import { defineIcon } from '../icon/Icon';
import { mentionsEmits, mentionsProps } from './type';
import { definePopover } from '../popover';
import { defineSelectOption } from '../select';
import { useSelect } from '../select/useSelect';
import { renderCustom } from '../custom-renderer';
import { getCompParts, intl } from 'common';

const name = 'mentions';
const parts = ['root', 'float-label', 'wrapper', 'textarea', 'length-info', 'content'] as const;
const compParts = getCompParts(name, parts);
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

    const selected = ref<{ value: string | undefined }>({ value: undefined });
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
            // const rect = getRect(endRange);
            // get the rect immediately to fix a bug. found that in safari if use the range as popover target, the position would be incorrect
            // seems that the range endContainer is updated to span, not the text node, and at that time the rect is incorrect for unknown reason
            // target.value = {
            //   getBoundingClientRect: () => rect,
            // };
            // above issue may be caused by contenteditable=false for mentions span. Fixed rect will lead to position wrong after scroll, remove it.
            target.value = endRange;
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
            return (
              mentionRenderer &&
              ((item: MentionSpan, necessaryProps: Record<string, any>) =>
                renderCustom(runIfFn(mentionRenderer, item, necessaryProps)))
            );
          },
        },
        props,
      ),
    );

    let afterCloseClean: AnyFn | undefined;
    watchEffect(() => {
      if (!state.activeMentionValue && !state.lastTrigger) {
        // delay cleaning selected until popover is closed, to avoid visual jitter during closing animation. freezeWhenClosing is not working, as selected changing and closing happen at the same time
        afterCloseClean = () => (afterCloseClean = selected.value.value = undefined);
      } else selected.value.value = state.activeMentionValue;
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
        states.withClearIcon && renderElement('icon', { name: 'x', class: [ns.e('clear-icon')], onClick: clearValue }),
    );

    const { render: optionsRender, hasOption } = useOptions(props, 'select-option', {
      mapOptionKey: () => state.lastTrigger,
    });

    const popoverProps = {
      showArrow: false,
      target,
      beforeOpen: activateMethods.initIndex,
      onAfterClose() {
        afterCloseClean?.();
      },
    };

    const contenteditable = isSupportPlaintextEditable() ? 'plaintext-only' : 'true';
    return () => {
      const { editable, readonly } = editComputed;
      const { placeholder, labelType, label, rows, cols, noOptions, resize } = props;
      const floatLabel = label || placeholder;
      const hasFloatLabel = labelType === 'float' && floatLabel;
      return (
        <label part={compParts[0]} class={stateClass.value}>
          {hasFloatLabel && (
            <div class={[ns.e('label'), ns.is('float-label')]} part={compParts[1]}>
              {floatLabel}
              <div class={ns.em('label', 'float-background')}>{floatLabel}</div>
            </div>
          )}
          <span class={ns.e('wrapper')} part={compParts[2]}>
            <textarea
              part={compParts[3]}
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
              part={compParts[3]}
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
          <div class={ns.e('length-info')} part={compParts[4]}>
            {lengthInfo.value}
          </div>
          {!noOptions &&
            renderElement(
              'popover',
              {
                ...popoverProps,
                open: !!state.lastTrigger,
              },
              <div class={ns.e('content')} part={compParts[5]} slot="pop-content" onPointerdown={popOnPointerDown}>
                {!context.value.length && !hasOption() ? (
                  <slot name="no-content">
                    <div class={ns.e('empty')}>
                      {renderElement('icon', { name: 'warning', class: ns.em('empty', 'icon') })}
                      <span class={ns.em('empty', 'text')}>{intl('select.noContent').d('No content')}</span>
                    </div>
                  </slot>
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
export type iMentions = InstanceType<tMentions>;

export const defineMentions = createDefineElement(
  name,
  Mentions,
  {
    triggers: ['@'],
    suffix: ' ',
  },
  parts,
  {
    icon: defineIcon,
    popover: definePopover,
    'select-option': defineSelectOption,
  },
);
