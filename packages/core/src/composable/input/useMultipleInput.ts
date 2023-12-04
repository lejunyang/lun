import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils';
import {
  getDeepestActiveElement,
  getNextMatchElInTree,
  getPreviousMatchElInTree,
  isEnterDown,
  isNilOrEmptyStr,
  shadowContains,
  toArrayIfNotNil,
} from '@lun/utils';
import { InputType, UseInputOptions, useInput } from './useInput';
import { nextTick } from 'vue';

export type UseMultipleInputOptions<T extends InputType = 'text'> = Omit<UseInputOptions<T>, 'onChange'> & {
  multiple?: boolean;
  /**
   * @default 'tagIndex'
   */
  tagIndexAttr?: string;
  splitter?: string | RegExp;
  unique?: boolean;
  reserveInput?: boolean;
  value?: string[] | string | null;
  onChange: (value: string[]) => void;
  iterateOptions?: { isMatch?: (el: Element) => boolean; shouldStop: (el: Element) => boolean };
};

export function useMultipleInput<IType extends InputType = 'text'>(
  options: MaybeRefLikeOrGetter<UseMultipleInputOptions<IType>>
) {
  const handleDeleteTag = (target?: HTMLElement | null) => {
    if (!target) return;
    const { tagIndexAttr = 'tagIndex', value, onChange, iterateOptions } = unrefOrGet(options)!;
    const index = Number(target.dataset[tagIndexAttr]);
    if (Number.isInteger(index) && index >= 0) {
      const values = toArrayIfNotNil(value!);
      const newValue = values.filter((_, i) => i !== index);
      if (onChange) onChange(newValue);
      // after delete, focus on next tag or input
      if (values.length !== newValue.length) {
        const nextTarget = getNextMatchElInTree(target, iterateOptions) as HTMLElement;
        nextTick(() => {
          if (nextTarget.isConnected) nextTarget.focus();
          else {
            // rely on dom, if use value+index as tag key, following tags will update after every change, nextTarget is tangling
            // TODO
          }
        });
      }
    }
  };
  const wrapperHandlers = {
    onKeydown(e: KeyboardEvent) {
      const { iterateOptions } = unrefOrGet(options)!;
      let target = e.target as HTMLElement;
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (target.tagName === 'INPUT' && e.key === 'Backspace') {
          // handle input only when no value
          if ((target as HTMLInputElement).value) return;
          else target = getPreviousMatchElInTree(target, iterateOptions) as HTMLElement;
        }
        // different from Backspace/Delete behavior in text, delete current focused tag whatever
        handleDeleteTag(target);
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const active = getDeepestActiveElement(); // need to find deepest active element because of shadow dom
        if (!active || (active !== target && !shadowContains(target, active))) return;
        const { isMatch, shouldStop } = iterateOptions || {};
        let targetEl = null as Element | null;
        if (e.key === 'ArrowLeft') targetEl = getPreviousMatchElInTree(target, { isMatch, shouldStop });
        else if (e.key === 'ArrowRight') targetEl = getNextMatchElInTree(target, { isMatch, shouldStop });
        (targetEl as HTMLElement)?.focus();
      }
    },
  };

  const transform = (val: any, e: Event) => {
    const { splitter = ',', unique, reserveInput, multiple, value } = unrefOrGet(options)!;
    const valuesBefore = toArrayIfNotNil(value);
    if (!multiple || isNilOrEmptyStr(val)) return val;
    const valuesNow = val.split(splitter);
    if (!valuesNow.length) return val;
    const result = valuesBefore.concat(valuesNow).filter((i) => !isNilOrEmptyStr(i));
    const needChange = e.type === 'change' || valuesNow.length > 1 || isEnterDown(e);
    if (!needChange) return valuesBefore;
    // TODO reserveInput is conflict with ‘change' event
    if (!reserveInput) {
      (e.target as HTMLInputElement).value = '';
    }
    return unique ? Array.from(new Set(result)) : result;
  };
  const [inputHandlers, state] = useInput<IType>(options as any, {
    transform,
    onKeydown(e, state, utils) {
      const { multiple, updateWhen } = unrefOrGet(options)!;
      if (multiple && isEnterDown(e) && !state.composing) {
        const target = e.target as HTMLInputElement;
        if (target.value) {
          utils.handleEvent(updateWhen || 'not-composing', e);
        }
      }
    },
  });
  return {
    wrapperHandlers,
    inputHandlers,
    state,
  };
}
