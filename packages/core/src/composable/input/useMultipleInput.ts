import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils';
import {
  arrayFrom,
  clamp,
  getDeepestActiveElement,
  getFirstOfIterable,
  getNextMatchElInTree,
  getPreviousMatchElInTree,
  isArrowLeftEvent,
  isArrowRightEvent,
  isEnterDown,
  isHTMLInputElement,
  isNilOrEmptyStr,
  prevent,
  shadowContains,
  toArrayIfNotNil,
} from '@lun/utils';
import { UseInputOptions, useInput } from './useInput';
import { nextTick } from 'vue';
import { presets } from '../../presets/index';

type IterateOptions = Parameters<typeof getNextMatchElInTree>[1] & {};

export type UseMultipleInputOptions = Omit<UseInputOptions, 'onChange' | 'value'> & {
  value?: MaybeRefLikeOrGetter<string | number | string[] | number[]>;
  multiple?: boolean;
  /**
   * @default 'tagIndex'
   */
  tagIndexAttr?: string;
  separator?: string | RegExp;
  unique?: boolean;
  reserveInput?: boolean;
  maxTags?: number | string;
  onChange: (value: string[] | number[], targetValue?: string) => void;
  onInputUpdate?: (value: string | number) => void;
  onTagsAdd?: (values: string[] | number[]) => void;
  onTagsRemove?: (values: string[] | number[]) => void;
  iterateOptions?: IterateOptions;
  getCurrentIndex?: (el: HTMLElement) => number;
  getTagFromIndex?: (index: number) => HTMLElement | undefined;
};

const defaultTagIndexAttr = 'tagIndex';
const getDefaultIterateOptions = (options?: IterateOptions, attr: string = defaultTagIndexAttr) => ({
  isMatch: (el: Element) => !!(el as HTMLElement).dataset?.[attr] || isHTMLInputElement(el),
  ...options,
});

export function useMultipleInput(options: MaybeRefLikeOrGetter<UseMultipleInputOptions, true>) {
  const handleDeleteTag = (target?: HTMLElement | null) => {
    if (!target) return;
    const { tagIndexAttr = defaultTagIndexAttr, value, onChange, iterateOptions, onTagsRemove } = unrefOrGet(options)!;
    const index = +target.dataset[tagIndexAttr]!;
    const values = toArrayIfNotNil(unrefOrGet(value));
    if (Number.isInteger(index) && index >= 0 && index < values.length) {
      const newValues = values.slice();
      const removed = newValues.splice(index, 1);
      if (removed.length) {
        onChange && onChange(newValues);
        onTagsRemove && onTagsRemove(removed);
        // after delete, focus on next tag or input
        const nextTarget = getNextMatchElInTree(
          target,
          getDefaultIterateOptions(iterateOptions, tagIndexAttr),
        ) as HTMLElement;
        nextTick(() => {
          if (nextTarget?.isConnected) nextTarget.focus();
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
      let { iterateOptions, tagIndexAttr, getTagFromIndex, getCurrentIndex, value } = unrefOrGet(options)!;
      iterateOptions = getDefaultIterateOptions(iterateOptions, tagIndexAttr);
      let target = e.target as HTMLElement;
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (isHTMLInputElement(target) && e.key === 'Backspace') {
          // handle input only when no value
          if (target.value) return;
          else target = getPreviousMatchElInTree(target, iterateOptions) as HTMLElement;
        }
        // different from Backspace/Delete behavior in text, delete current focused tag whatever
        handleDeleteTag(target);
      }
      if (!getCurrentIndex || !getTagFromIndex) return;
      // arrow left/right to focus on previous/next tag
      if (isArrowLeftEvent(e) || isArrowRightEvent(e)) {
        const active = getDeepestActiveElement(); // need to find deepest active element because of shadow dom
        if (!active || (active !== target && !shadowContains(target, active))) return;
        // only focus on previous tag when selection is collapsed and at the beginning of input
        if (isHTMLInputElement(active) && (active.selectionStart !== 0 || active.selectionEnd !== 0)) return;
        let currentIndex = getCurrentIndex(active),
          currentLength = toArrayIfNotNil(unrefOrGet(value)).length;
        if (currentIndex === -1 || isNaN(currentIndex)) currentIndex = isArrowLeftEvent(e) ? currentLength - 1 : 0;
        else currentIndex = clamp(currentIndex + (isArrowLeftEvent(e) ? -1 : 1), 0, currentLength - 1);
        const tag = getTagFromIndex(currentIndex);
        tag && tag.focus();
      }
    },
  };

  const transform = (val: string | number, e: Event) => {
    const {
      separator = ',',
      unique,
      reserveInput,
      multiple,
      value,
      onInputUpdate,
      maxTags,
      onTagsAdd,
      type,
    } = unrefOrGet(options)!;
    const strVal = String(val);
    onInputUpdate && onInputUpdate(strVal);
    if (!multiple) return val;
    val = strVal;
    const valuesBefore = toArrayIfNotNil(unrefOrGet(value));
    if (isNilOrEmptyStr(val)) return value;
    const valuesNow = val.split(separator);
    if (!valuesNow.length) return val;
    const needChange = e.type === 'change' || valuesNow.length > 1 || isEnterDown(e);
    if (!needChange) return valuesBefore;
    const result = [...valuesBefore];
    const uniqueResult = new Set<number | string>(unique ? valuesBefore : undefined);
    const added: string[] | number[] = [];
    valuesNow.forEach((v: number | string) => {
      if (isNilOrEmptyStr(v)) return;
      if (type === 'number') v = presets.math.toRawNum(v);
      if (unique) {
        if (uniqueResult.has(v)) return;
        uniqueResult.add(v);
      } else result.push(v);
      (added as Array<number | string>).push(v);
    });
    // TODO reserveInput is conflict with ‘change' event
    if (!reserveInput) {
      (e.target as HTMLInputElement).value = '';
      onInputUpdate && onInputUpdate('');
    }
    const final = unique ? arrayFrom(uniqueResult) : result;
    onTagsAdd && added.length && onTagsAdd(added);
    return +maxTags! >= 0 ? final.slice(0, +maxTags!) : final;
  };
  const {
    handlers: inputHandlers,
    state,
    ...others
  } = useInput(options as any, {
    transform,
    onBeforeinput(e) {
      const { value, maxTags } = unrefOrGet(options)!;
      const values = toArrayIfNotNil(value);
      if (maxTags && values.length >= +maxTags) prevent(e);
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
