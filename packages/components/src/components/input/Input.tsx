import { computed } from 'vue';
import { useSetupEdit, useComputedBreakpoints, useMultipleInput } from '@lun/core';
import { defineSSRCustomFormElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { useNamespace, useVModelCompatible, useValueModel } from 'hooks';
import { inputProps } from './type';
import { isEmpty } from '@lun/utils';
import { defineCustomRenderer } from "../custom-renderer/CustomRenderer";

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

    const classed = {
      root: computed(() => [
        ns.b('root'),
        // 'l-input-variant-surface',
        ns.m('surface'),
        ns.bp(props.size, ns.m('size')),
        ns.is(isEmpty(valueModel.value) ? 'empty' : 'not-empty'),
      ]),
    };

    const { inputHandlers, wrapperHandlers } = useMultipleInput(
      computed(() => ({
        ...props,
        value: valueModel.value,
        onChange: (val) => {
          updateVModel(val);
          emit('update', val);
        },
        onEnterDown(e) {
          emit('enterDown', e);
        },
      }))
    );
    // TODO mouse enter add class to show the clear button.  animation, hide suffix slot(render both, z-index?)
    return () => {
      const input = (
        <input
          {...attrs}
          type={props.type}
          id="input"
          part="input"
          class={[ns.b()]}
          value={!props.multiple ? valueModel.value : undefined}
          placeholder={props.placeholder}
          disabled={editComputed.value.disabled}
          readonly={editComputed.value.readonly}
          {...inputHandlers}
        />
      );
      return (
        <span part="root" class={classed.root.value}>
          <div class={[ns.b('slot'), ns.b('addon-before')]} part="addon-before">
            <slot name="addon-before"></slot>
          </div>
          <label class={ns.b('label')} part="label">
            <div class={[ns.b('slot'), ns.b('prefix')]} part="prefix">
              <slot name="prefix"></slot>
              {props.labelType === 'float' && (
                <div class={[ns.b('label'), ns.is('float-label')]} part="float-label">
                  {props.label}
                  <div class={ns.bem('label', 'back', 'float')}>{props.label}</div>
                </div>
              )}
            </div>
            <span style="position: relative">
              {/* render when value is defined，in case it covers float label and placeholder */}
              {!isEmpty(valueModel.value) && (
                <div class={[ns.b(), ns.b('custom-renderer')]}>
                  <slot name="renderer"></slot>
                </div>
              )}
              {props.multiple ? (
                <span {...wrapperHandlers}>
                  {Array.isArray(valueModel.value) &&
                    valueModel.value.map((v, index) => {
                      const tagProps = {
                        tabindex: -1,
                        'data-tag-index': index,
                        'data-tag-value': v,
                        key: String(v),
                      };
                      if (props.tagRenderer)
                        return renderElement('custom-renderer', {
                          ...tagProps,
                          type: props.tagRendererType,
                          content: props.tagRenderer(v, index),
                        });
                      return <span {...tagProps}>{v}</span>;
                    })}
                  {input}
                </span>
              ) : (
                input
              )}
            </span>
            <span class={ns.e('back')} />
            <span class={[ns.b('slot'), ns.b('suffix'), props.showClearIcon && ns.is('with-clear')]} part="suffix">
              {props.showClearIcon && <span class={[ns.be('suffix', 'clear-icon')]}>x</span>}
              <slot name="suffix">
                <span class={[ns.be('suffix', 'clear-icon')]}>x</span>
              </slot>
            </span>
            {props.maxLength! >= 0 && (
              <div class={ns.e('length-info')}>
                {valueModel.value?.length || '0'}/{props.maxLength}
              </div>
            )}
          </label>
          <div class={[ns.b('slot'), ns.b('addon-after')]} part="addon-after">
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

export const defineInput = createDefineElement(name, Input, { 'custom-renderer': defineCustomRenderer });
