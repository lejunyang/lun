import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils';
import {
  getDeepestActiveElement,
  getFirstOfIterable,
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
  separator?: string | RegExp;
  unique?: boolean;
  reserveInput?: boolean;
  maxTags?: number | string;
  onChange: (value: string[]) => void;
  onInputUpdate?: (value: string) => void;
  onTagsAdd?: (values: string[]) => void;
  onTagsRemove?: (values: string[]) => void;
  iterateOptions?: { isMatch?: (el: Element) => boolean; shouldStop: (el: Element) => boolean };
};

export function useMultipleInput<IType extends InputType = 'text'>(
  options: MaybeRefLikeOrGetter<UseMultipleInputOptions<IType>, true>,
) {
  const handleDeleteTag = (target?: HTMLElement | null) => {
    if (!target) return;
    const { tagIndexAttr = 'tagIndex', value, onChange, iterateOptions, onTagsRemove } = unrefOrGet(options)!;
    const index = +target.dataset[tagIndexAttr]!;
    const values = toArrayIfNotNil(unrefOrGet(value));
    if (Number.isInteger(index) && index >= 0 && index < values.length) {
      const newValues = values.slice();
      const removed = newValues.splice(index, 1);
      if (removed.length) {
        onChange && onChange(newValues);
        onTagsRemove && onTagsRemove(removed);
        // after delete, focus on next tag or input
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
      // arrow left/right to focus on previous/next tag
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

  const transform = (val: string, e: Event) => {
    const {
      separator = ',',
      unique,
      reserveInput,
      multiple,
      value,
      onInputUpdate,
      maxTags,
      onTagsAdd,
    } = unrefOrGet(options)!;
    onInputUpdate && onInputUpdate(val);
    if (!multiple) return val;
    const valuesBefore = toArrayIfNotNil(unrefOrGet(value));
    if (isNilOrEmptyStr(val)) return value;
    const valuesNow = val.split(separator);
    console.log('valuesNow', valuesNow);
    if (!valuesNow.length) return val;
    const needChange = e.type === 'change' || valuesNow.length > 1 || isEnterDown(e);
    console.log('needChange', needChange);
    if (!needChange) return valuesBefore;
    const result = [...valuesBefore];
    const uniqueResult = new Set(unique ? valuesBefore : undefined);
    const added: string[] = [];
    valuesNow.forEach((v) => {
      if (isNilOrEmptyStr(v)) return;
      if (unique) {
        if (uniqueResult.has(v)) return;
        uniqueResult.add(v);
      } else result.push(v);
      added.push(v);
    });
    // TODO reserveInput is conflict with ‘change' event
    if (!reserveInput) {
      (e.target as HTMLInputElement).value = '';
      onInputUpdate && onInputUpdate('');
    }
    const final = unique ? Array.from(uniqueResult) : result;
    onTagsAdd && added.length && onTagsAdd(added);
    return +maxTags! >= 0 ? final.slice(0, +maxTags!) : final;
  };
  const {
    handlers: inputHandlers,
    state,
    ...others
  } = useInput<IType>(options as any, {
    transform,
    onBeforeinput(e) {
      const { value, maxTags } = unrefOrGet(options)!;
      const values = toArrayIfNotNil(value);
      if (maxTags && values.length >= +maxTags) e.preventDefault();
    },
    onInput(e) {
      const { onInputUpdate } = unrefOrGet(options);
      onInputUpdate && onInputUpdate((e.target as HTMLInputElement).value);
    },
    onKeydown(e, state, utils) {
      const { multiple, updateWhen } = state.transformedOptions;
      if (multiple && isEnterDown(e) && !state.composing) {
        const target = e.target as HTMLInputElement;
        if (target.value) {
          utils.handleEvent(getFirstOfIterable(updateWhen)!, e);
        }
      }
    },
  });
  return {
    wrapperHandlers,
    inputHandlers,
    state,
    ...others,
  };
}
