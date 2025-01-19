import { computed, ref, mergeProps, Transition } from 'vue';
import {
  useSetupEdit,
  useMultipleInput,
  refLikeToDescriptors,
  useInputElement,
  isNumberInputType,
  useSetupEvent,
} from '@lun-web/core';
import { defineCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { useCEExpose, useCEStates, useNamespace, usePropsFromFormItem, useSlot, useValueModel } from 'hooks';
import { inputEmits, inputProps } from './type';
import { isEmpty, isArray, runIfFn, raf, arrayFrom, shadowContains, virtualGetMerge } from '@lun-web/utils';
import { renderCustom } from '../custom-renderer/CustomRenderer';
import { defineIcon } from '../icon/Icon';
import { defineTag } from '../tag/Tag';
import {
  ElementWithExpose,
  getCompParts,
  getTransitionProps,
  InputFocusOption,
  pickThemeProps,
  renderStatusIcon,
} from 'common';
import { GlobalStaticConfig } from 'config';
import usePassword from './Input.password';
import { useAutoUpdateLabel } from './hooks';

const name = 'input';
const parts = [
  'root',
  'inner-input',
  'label',
  'prepend',
  'wrapper',
  'prefix',
  'background',
  'renderer',
  'suffix',
  'length-info',
  'append',
  'tag-container',
  'steps-wrapper',
  'up',
  'down',
  'plus',
  'minus',
  'float-label',
  'float-background',
  'multi-input-wrapper',
  'carousel-label',
] as const;
const compParts = getCompParts(name, parts);
export const Input = defineCustomElement({
  name,
  props: inputProps,
  formAssociated: true,
  emits: inputEmits,
  setup(props, { emit: e }) {
    const emit = useSetupEvent<typeof e>();
    const valueModel = useValueModel(props);
    // when type=number, valueModel is a number, but we need to avoid update input's value when it's '1.'
    const strValModel = ref('');
    const { status, validateProps } = usePropsFromFormItem(props);
    const ns = useNamespace(name, { status });
    const [editComputed] = useSetupEdit();
    const [inputRef, methods] = useInputElement<HTMLInputElement>();
    const valueForMultiple = ref(''); // used to store the value when it's multiple input
    const multiWrapper = ref<HTMLElement>();

    const { inputHandlers, wrapperHandlers, numberMethods, stepUpHandlers, stepDownHandlers, state } = useMultipleInput(
      // it was computed, but spread props will make it re-compute every time the value changes, so use virtualGetMerge instead
      virtualGetMerge(
        {
          value: valueModel,
          input: inputRef,
          get disabled() {
            return !editComputed.editable;
          },
          onChange(val: string | number | string[] | number[], targetVal?: string) {
            valueModel.value = val;
            targetVal != null && (strValModel.value = targetVal);
          },
          onInputUpdate(val: string | number) {
            // MUST return when it's not multiple, seems that updating valueForMultiple will make input rerender
            // and that will cause input composition issue when input is empty
            if (!props.multiple) return;
            valueForMultiple.value = val ? String(val) : '';
            emit('tagsComposing', val);
          },
          onEnterDown(e: KeyboardEvent) {
            emit('enterDown', e);
          },
          onTagsAdd(addedTags: string[]) {
            emit('tagsAdd', addedTags);
          },
          onTagsRemove(removedTags: string[]) {
            emit('tagsRemove', removedTags);
          },
          getTagIndex(el: HTMLElement) {
            return arrayFrom(multiWrapper.value!.children).findIndex((child) => shadowContains(child, el));
          },
          getTagFromIndex(index: number) {
            return multiWrapper.value?.children[index] as HTMLElement;
          },
        },
        validateProps,
        props,
      ),
    );

    const finalInputVal = computed(() => {
      if (props.multiple) return valueForMultiple.value;
      const { type } = validateProps;
      const { value } = valueModel,
        str = strValModel.value;
      // +value === +str is to avoid input rerender when input is '1.' and type is number
      // but we need to return valueModel to update the input if it's not focusing
      // because when we input '1.', actual input value is '1', and it doesn't trigger change event after blur, so normalizeNumber won't happen in useInput
      if (type === 'number' && str && +value! === +str && state.focusing) return str;
      else return value;
    });

    const clearValue = () => {
      if (props.multiple) {
        valueModel.value = [];
        valueForMultiple.value = '';
        emit('tagsComposing', '');
        emit('tagsRemove', []);
      } else valueModel.value = null;
    };

    const [stateClass, states] = useCEStates(() => ({
      empty: isEmpty(valueModel.value) && !valueForMultiple.value,
      multiple: props.multiple,
      required: validateProps.required,
      withPrepend: !prependEmpty.value,
      withAppend: !appendEmpty.value,
      withRenderer: !rendererEmpty.value,
    }));

    const lengthInfo = computed(() => {
      const valueLength = props.multiple ? valueForMultiple.value.length : String(valueModel.value ?? '').length;
      // if no maxLength, show current char count as length info
      return +props.maxLength! >= 0 ? (valueLength || '0') + '/' + props.maxLength : valueLength;
    });

    const numberStepIcons = computed(() => {
      const { stepControl, multiple } = props;
      if (!isNumberInputType(validateProps.type) || multiple) return;
      const step = ns.e('step'),
        arrow = ns.e('arrow'),
        slot = ns.e('slot');
      return {
        arrow: stepControl === 'up-down' && (
          <span class={ns.e('steps-wrapper')} part={compParts[12]}>
            {renderElement('icon', { class: [step, arrow], name: 'up', part: 'up', ...stepUpHandlers })}
            {renderElement('icon', { class: [step, arrow], name: 'down', part: 'down', ...stepDownHandlers })}
          </span>
        ),
        plus: stepControl === 'plus-minus' && (
          <div class={[slot, ns.e('plus')]} part={compParts[15]}>
            {renderElement('icon', { class: step, name: 'plus', part: 'plus', ...stepUpHandlers })}
          </div>
        ),
        minus: stepControl === 'plus-minus' && (
          <div class={[slot, ns.e('minus')]} part={compParts[16]}>
            {renderElement('icon', { class: step, name: 'minus', part: 'minus', ...stepDownHandlers })}
          </div>
        ),
      };
    });

    const rootOnPointerDown = () => {
      // input will gain focus after we click anything inside label, but it's not immediate. We need to focus the input to show focus styles as soon as possible
      raf(() => {
        if (editComputed.interactive) inputRef.value?.focus();
      });
    };

    const [prependSlot, prependEmpty] = useSlot('prepend');
    const [prefixSlot, prefixEmpty] = useSlot('prefix');
    const [suffixSlot, suffixEmpty] = useSlot('suffix');
    const [appendSlot, appendEmpty] = useSlot('append');
    const [rendererSlot, rendererEmpty] = useSlot('renderer');

    const [passwordIcon, localType, togglePassword] = usePassword(() => validateProps.type, ns);

    const clearIcon = computed(
      () =>
        props.showClearIcon &&
        editComputed.editable &&
        renderElement('icon', { name: 'x', class: [ns.em('suffix', 'clear-icon')], onClick: clearValue }),
    );

    const statusIcon = computed(() => {
      if (!props.showStatusIcon) return;
      return renderStatusIcon(status.value);
    });

    useCEExpose(
      {
        ...methods,
        ...numberMethods,
        get valueAsNumber() {
          return GlobalStaticConfig.math.toRawNum(valueModel.value);
        },
        resetValue() {
          valueModel.value = props.value;
        },
        togglePassword,
      },
      refLikeToDescriptors({ input: inputRef, innerValue: valueModel }),
    );

    const label = useAutoUpdateLabel(props);

    return () => {
      const { disabled, editable } = editComputed;
      const {
        multiple,
        placeholder,
        labelType,
        wrapTags,
        spellcheck,
        autofocus,
        tagRemoveIcon,
        tagProps,
        tagRenderer,
      } = props;
      const type = localType.value,
        inputType = type === 'number' || type === 'password' ? type : 'text';
      const finalLabel = label.value || placeholder,
        hasFloatLabel = labelType === 'float' && finalLabel,
        hasCarouselLabel = labelType === 'carousel' && finalLabel,
        hasSpecialLabel = hasFloatLabel || hasCarouselLabel;
      const { empty, withPrepend, withAppend } = states;
      const hidePlaceholderForMultiple = multiple && !empty;
      const input = (
        <input
          autofocus={autofocus}
          spellcheck={spellcheck}
          exportparts=""
          type={inputType}
          inputmode={type === 'number-text' ? 'numeric' : undefined}
          ref={inputRef}
          part={compParts[1]}
          class={[ns.e('inner-input')]}
          value={finalInputVal.value}
          placeholder={hasSpecialLabel || hidePlaceholderForMultiple ? undefined : placeholder}
          disabled={disabled}
          readonly={!editable}
          size={hidePlaceholderForMultiple ? 1 : undefined}
          {...inputHandlers}
        />
      );
      const wrapTransition = (node: any) =>
        hasCarouselLabel ? (
          <Transition {...getTransitionProps(props, 'carouselLabel', 'slideDown')}>{node}</Transition>
        ) : (
          node
        );
      return (
        <span part={compParts[0]} class={[stateClass.value, ns.m(type)]} onPointerdown={rootOnPointerDown}>
          <div
            class={[ns.e('slot'), ns.e('prepend'), ns.e('addon'), ns.isOr('empty', !withPrepend)]}
            part={compParts[3]}
          >
            {prependSlot()}
          </div>
          <label class={[ns.e('label'), hasCarouselLabel && ns.em('label', 'has-carousel')]} part={compParts[2]}>
            {hasSpecialLabel &&
              wrapTransition(
                <div
                  key={hasCarouselLabel ? finalLabel : undefined}
                  class={[
                    ns.e('label'),
                    hasFloatLabel && ns.em('label', 'float'),
                    hasCarouselLabel && ns.em('label', 'carousel'),
                    hasSpecialLabel && ns.em('label', 'special'),
                  ]}
                  part={compParts[hasFloatLabel ? 17 : 20]}
                >
                  {finalLabel}
                  {hasFloatLabel && (
                    <div class={ns.em('label', 'float-background')} part={compParts[18]}>
                      {finalLabel}
                    </div>
                  )}
                </div>,
              )}
            {numberStepIcons.value?.minus}
            <div class={[ns.e('slot'), ns.e('prefix'), ns.isOr('empty', prefixEmpty)]} part={compParts[5]}>
              {prefixSlot()}
            </div>
            <span class={ns.e('wrapper')} part={compParts[4]}>
              {/* render when value is defined，in case it covers float label and placeholder */}
              {/* TODO support custom renderer when multiple */}
              {!empty && !multiple && (
                <div class={[ns.e('inner-input'), ns.e('renderer')]} part={compParts[7]}>
                  {rendererSlot()}
                </div>
              )}
              {multiple ? (
                <span
                  {...wrapperHandlers}
                  ref={multiWrapper}
                  class={[
                    ns.e('tag-container'),
                    ns.isOr(`wrap`, wrapTags),
                    ns.is('no-tags', isEmpty(valueModel.value)),
                  ]}
                  part={compParts[11]}
                >
                  {isArray(valueModel.value) &&
                    valueModel.value.map((v, index) => {
                      const finalTagProps = mergeProps(pickThemeProps(props), runIfFn(tagProps, v, index)!, {
                        tabindex: editable ? 0 : undefined,
                        'data-tag-index': String(index), // bug starting from vue3.5, must use string for vue custom element
                        'data-tag-value': String(v),
                        key: String(v),
                        class: [ns.e('tag')],
                        onAfterRemove: () => (valueModel.value as string[]).splice(index, 1),
                      });
                      return tagRenderer
                        ? renderCustom(runIfFn(tagRenderer, v, index, finalTagProps))
                        : renderElement('tag', {
                            label: v,
                            ...finalTagProps,
                            removable: editable && tagRemoveIcon,
                          });
                    })}
                  {editable && (
                    // use grid and pseudo to make the input auto grow, see in https://css-tricks.com/auto-growing-inputs-textareas/
                    <span
                      class={ns.e('multi-input-wrapper')}
                      part={compParts[19]}
                      data-value={hidePlaceholderForMultiple ? valueForMultiple.value : placeholder}
                    >
                      {input}
                    </span>
                  )}
                </span>
              ) : (
                input
              )}
            </span>
            <span class={ns.e('background')} part={compParts[6]} />
            <span
              class={[
                ns.e('slot'),
                ns.e('suffix'),
                props.showClearIcon && ns.is('with-clear'),
                ns.isOr('empty', suffixEmpty.value && !clearIcon.value && !statusIcon.value && !passwordIcon.value),
              ]}
              part={compParts[8]}
            >
              {clearIcon.value}
              {passwordIcon.value}
              {suffixSlot()}
              {statusIcon.value}
            </span>
            {props.showLengthInfo && (
              <span class={ns.e('length-info')} part={compParts[9]}>
                {lengthInfo.value}
              </span>
            )}
            {numberStepIcons.value?.plus}
            {numberStepIcons.value?.arrow}
          </label>
          <div
            class={[ns.e('slot'), ns.e('append'), ns.e('addon'), ns.isOr('empty', !withAppend)]}
            part={compParts[10]}
          >
            {appendSlot()}
          </div>
        </span>
      );
    };
  },
});

export type InputExpose = {
  focus: (options?: InputFocusOption) => void;
  blur: () => void;
  stepUp(): void;
  stepDown(): void;
  togglePassword: (force?: boolean) => void;
  /** reset input's internal value to props.value */
  resetValue(): void;
  /** get input's internal value */
  readonly innerValue: string | number | string[] | number[];
  readonly valueAsNumber: number;
  readonly input: HTMLInputElement;
};
export type tInput = ElementWithExpose<typeof Input, InputExpose>;
export type iInput = InstanceType<tInput>;

export const defineInput = createDefineElement(
  name,
  Input,
  {
    trim: true,
    updateWhen: 'auto',
    restrictWhen: 'notComposing',
    transformWhen: 'notComposing',
    showClearIcon: true,
    separator: /[\s,]/,
    stepControl: 'up-down',
    required: undefined,
    normalizeNumber: true,
    tagRemoveIcon: true,
  },
  parts,
  [defineIcon, defineTag],
);
