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

    const { inputHandlers, wrapperHandlers } = useMultipleInput(
      computed(() => ({
        ...props,
        value: valueModel.value,
        onChange: (val) => {
          updateVModel(val);
          valueModel.value = val;
        },
        onEnterDown(e) {
          emit('enterDown', e);
        },
      }))
    );
    const clearValue = () => (props.multiple ? (valueModel.value = []) : (valueModel.value = null));

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
      renderElement('icon', { name: 'x', class: [ns.em('suffix', 'clear-icon')], onClick: clearValue });

    // TODO mouse enter add class to show the clear button.  animation, hide suffix slot(render both, z-index?)
    return () => {
      const input = (
        <input
          {...attrs}
          type={props.type}
          ref={inputRef}
          part={ns.p('input')}
          class={[ns.e('inner-input')]}
          value={!props.multiple ? valueModel.value : undefined}
          placeholder={props.placeholder}
          disabled={editComputed.value.disabled}
          readonly={editComputed.value.readonly}
          {...inputHandlers}
        />
      );
      return (
        <span
          part={ns.p('root')}
          class={[
            ns.s(editComputed),
            ns.is(isEmpty(valueModel.value) ? 'empty' : 'not-empty'),
            ns.is('multiple', props.multiple),
          ]}
        >
          <div class={[ns.e('slot'), ns.b('addon-before')]} part={ns.p('addon-before')}>
            <slot name="addon-before"></slot>
          </div>
          <label class={ns.e('label')} part={ns.p('label')}>
            <div class={[ns.e('slot'), ns.e('prefix')]} part={ns.p('prefix')}>
              <slot name="prefix"></slot>
              {props.labelType === 'float' && (
                <div class={[ns.e('label'), ns.is('float-label')]} part={ns.p('float-label')}>
                  {props.label}
                  <div class={ns.em('label', 'float-background')}>{props.label}</div>
                </div>
              )}
            </div>
            <span style="position: relative">
              {/* render when value is defined，in case it covers float label and placeholder */}
              {!isEmpty(valueModel.value) && (
                <div class={[ns.e('inner-input'), ns.e('custom-renderer')]}>
                  <slot name="renderer"></slot>
                </div>
              )}
              {props.multiple ? (
                <span {...wrapperHandlers} class={[ns.e('tag-container')]}>
                  {isArray(valueModel.value) &&
                    valueModel.value.map((v, index) => {
                      const tagProps = {
                        tabindex: -1,
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
                          removable: true,
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
            {props.showLengthInfo && props.multiple && (
              <span class={ns.e('length-info')}>
                {/* if no maxLength, show current char count */}
                {props.maxLength! >= 0
                  ? valueModel.value?.length || '0' + '/' + props.maxLength
                  : valueModel.value?.length}
              </span>
            )}
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
