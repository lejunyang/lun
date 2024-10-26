import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils';
import {
  arrayFrom,
  getDeepestActiveElement,
  getFirstOfIterable,
  isArrowLeftEvent,
  isArrowRightEvent,
  isEnterDown,
  isHTMLInputElement,
  isNilOrEmptyStr,
  prevent,
  shadowContains,
  ensureArray,
} from '@lun/utils';
import { UseInputOptions, useInput } from './useInput';
import { nextTick } from 'vue';
import { presets } from '../../presets/index';

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
  getTagIndex?: (el: HTMLElement) => number;
  getTagFromIndex?: (index: number) => HTMLElement | undefined;
};

export function useMultipleInput(options: MaybeRefLikeOrGetter<UseMultipleInputOptions, true>) {
  const handleDeleteTag = (index?: number | null) => {
    if (index == null || isNaN(index)) return;
    const { value, onChange, onTagsRemove, getTagFromIndex, input } = unrefOrGet(options)!;
    const values = ensureArray(unrefOrGet(value)),
      newValues = values.slice(),
      removed = newValues.splice(index, 1);
    if (removed.length) {
      onChange && onChange(newValues);
      onTagsRemove && onTagsRemove(removed);
      // after delete, focus on new tag or input
      getTagFromIndex &&
        nextTick(() => {
          if (index >= newValues.length) unrefOrGet(input)?.focus();
          const tag = getTagFromIndex(index);
          tag && tag.focus();
        });
    }
  };
  const wrapperHandlers = {
    onKeydown(e: KeyboardEvent) {
      const { getTagFromIndex, getTagIndex, value, input } = unrefOrGet(options)!;
      if (!getTagIndex || !getTagFromIndex) return;
      let target = e.target as HTMLElement,
        isArrow: boolean,
        isInput: boolean;
      if (e.key === 'Backspace' || e.key === 'Delete' || (isArrow = isArrowLeftEvent(e) || isArrowRightEvent(e))) {
        // ignore these event if it's from input and selection is not at the start position
        if ((isInput = isHTMLInputElement(target)) && (target.selectionStart !== 0 || target.selectionEnd !== 0))
          return;

        const active = getDeepestActiveElement(); // need to find deepest active element because of shadow dom
        if (!active || (active !== target && !shadowContains(target, active))) return;

        let currentIndex = getTagIndex(active),
          currentLength = ensureArray(unrefOrGet(value)).length;

        // arrow left/right to focus on previous/next tag
        if (isArrow!) {
          if (currentIndex === -1 || isNaN(currentIndex)) currentIndex = isArrowLeftEvent(e) ? currentLength - 1 : 0;
          else if (currentIndex) currentIndex += isArrowLeftEvent(e) ? -1 : 1;
          if (currentIndex >= currentLength) return unrefOrGet(input)?.focus();
          const tag = getTagFromIndex(currentIndex);
          tag && tag.focus();
        } else {
          // is delete
          handleDeleteTag(isInput ? currentLength - 1 : currentIndex);
        }
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
    const valuesBefore = ensureArray(unrefOrGet(value));
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
      const values = ensureArray(value);
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
