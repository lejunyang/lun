import { UseInputOptions, useInput } from '../input';
import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils/ref';
import { useTempState } from '../../hooks/state';
import { isEnterDown, isString, toArrayIfNotNil } from '@lun/utils';
import { Ref, computed, h, reactive, ref, watchEffect } from 'vue';

export type UseMentionsOptions = UseInputOptions & {
  triggers?: string[] | string | null;
  suffix?: string;
  onTrigger?: (param: { trigger: string; input: string; textNode: Text }) => void;
};

export type MentionBlock = {
  trigger: string;
  label: string;
  value: any;
  suffix: string;
  actualLength: number;
};

export function useMentions(options: MaybeRefLikeOrGetter<UseMentionsOptions, true>) {
  const info = computed(() => {
    const { triggers, suffix } = unrefOrGet(options);
    const t = toArrayIfNotNil(triggers).filter(Boolean);
    return { triggers: t, suffix, on: suffix && t.length };
  });
  //  valueNow = 'abc@he- i don +1- what'
  const content = useTempState(() => {
    const { on, triggers, suffix } = info.value;
    const { value } = unrefOrGet(options);
    const valueNow = String(unrefOrGet(value) || '');
    if (!on) return [valueNow];
    const regex = new RegExp(`(${triggers.join('|')})([^\\r\\n]+?)${suffix}`, 'g');
    let lastIndex = 0,
      match: RegExpExecArray | null;
    const content: (string | MentionBlock)[] = [];
    while ((match = regex.exec(valueNow)) !== null) {
      // 添加前一个匹配项和当前匹配项之间的原始字符串
      if (match.index > lastIndex) {
        content.push(valueNow.substring(lastIndex, match.index));
      }
      const trigger = match[1];
      const label = match[2];
      content.push({
        trigger,
        label,
        value: label,
        suffix,
        actualLength: match[0].length,
      } as MentionBlock);
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < valueNow.length) {
      content.push(valueNow.substring(lastIndex));
    }
    return content;
  });

  const render = () => {
    return content.value.map((item, index) => {
      if (isString(item) || !item) return item;
      return h(
        'span',
        {
          'data-index': index,
          'data-is-mention': '',
          'data-trigger': item.trigger,
          'data-suffix': item.suffix,
          contenteditable: 'false',
          part: 'mention',
          style: { color: 'red' },
        },
        item.label,
      );
    });
  };

  const editRef = ref<HTMLElement>();
  /** actually it's ShadowRoot | Document, but ShadowRoot.getSelection is not standard */
  const root = ref() as Ref<Document>;
  // https://stackoverflow.com/questions/62054839/shadowroot-getselection
  let localGetSelection: () => Selection | null;
  const getRange = () => {
    const selection = localGetSelection() as any;
    return (selection.getComposedRanges ? selection.getComposedRanges()[0] : selection.getRangeAt(0)) as
      | StaticRange
      | Range;
  };
  const states = reactive({
    isRTL: false,
    isComposing: false,
  });
  watchEffect(() => {
    const { value } = editRef;
    root.value = value?.getRootNode() as Document;
    localGetSelection = root.value?.getSelection?.bind(root.value) || document.getSelection.bind(document);
    if (value) states.isRTL = getComputedStyle(value).direction === 'rtl';
  });

  let currentIndex = 0,
    lastTrigger: string | undefined,
    triggerStartIndex = 0,
    triggerEndIndex = 0,
    /** length of current composition text */
    compositionLen = 0,
    lastDeleteStartIndex = -1,
    lastDeleteEndIndex = 0;
  const cancelTrigger = () => {
    console.log('canceled');
    lastTrigger = undefined;
    triggerStartIndex = triggerEndIndex = 0;
  };

  const getRangeInfo = () => {
    const parent = getRange().startContainer.parentNode!;
    parent.normalize();
    // reget range after normalize
    const range = getRange();
    const { startContainer, endContainer } = range;
    let startIndex = -1,
      endIndex = -1;
    const children = Array.from(parent.childNodes);
    for (const i in children) {
      const node = children[i];
      if (node === startContainer) startIndex = +i;
      if (node === endContainer) endIndex = +i;
      if (startIndex > -1 && endIndex > -1) break;
    }
    return Object.assign(range, {
      /** index of startContainer in its parent */
      startIndex,
      /** index of endContainer in its parent */
      endIndex,
      currentNode: children[currentIndex],
    });
  };

  const checkIfCancelTrigger = (e: KeyboardEvent | MouseEvent | FocusEvent) => {
    if (lastTrigger) {
      const { focusOffset } = localGetSelection()!; // seems that endOffset is not always equal to focusOffset, startOffset counts
      let cancel = e.type === 'blur';
      cancel ||=
        focusOffset < triggerStartIndex || focusOffset > triggerEndIndex || getRangeInfo().endIndex !== currentIndex;
      if (cancel) cancelTrigger();
    }
  };

  const handlers = {
    onBeforeinput(_e: Event) {
      const { inputType, data, dataTransfer } = _e as InputEvent;
      const isDelete = inputType.startsWith('delete');
      const range = getRangeInfo();
      const { startContainer, startOffset, collapsed, startIndex, endIndex } = range;
      // we should get the index in beforeinput event, as in input event we can get wrong index in this way
      // for example, if we press enter, a new text node will be created, and at that time the index of endContainer will not be the correct index responding to content.value
      currentIndex = endIndex;
      console.log('before input index', currentIndex, startContainer.textContent, inputType);

      // if startIndex !== endIndex, there must be a mention block in the range
      if (!collapsed && isDelete && startIndex !== endIndex) {
        lastDeleteStartIndex = Math.min(startIndex, endIndex);
        lastDeleteEndIndex = Math.max(startIndex, endIndex);
        console.log('lastDeleteStartIndex', lastDeleteStartIndex, lastDeleteEndIndex);
      } else lastDeleteStartIndex = -1;

      // below it's to updating triggerEndIndex
      if (!lastTrigger) return;
      const selectionLen = range.toString().length;
      // don't add the composition length to the triggerEndIndex here as text can be changed after composition ends, it needs to be handled in composition event
      if (inputType.startsWith('insert') && !states.isComposing) {
        const add = data?.length || dataTransfer?.getData('text').length || 0;
        if (add || selectionLen) {
          triggerEndIndex += add;
          triggerEndIndex -= selectionLen; // if there is a selection in insert, the selection text will be deleted, it won't trigger another delete beforeInput
        }
      } else if (isDelete) {
        const isContentForward = inputType === 'deleteContentForward',
          deleteBackward = inputType === 'deleteContentBackward' || inputType === 'deleteByCut';
        // don't know what to do with other delete types, InputEvent.getTargetRanges always returns empty array in shadow DOM, don't know why, can only cancel trigger
        if (!deleteBackward && !isContentForward) return cancelTrigger();
        
        if (deleteBackward) {
          if (selectionLen) triggerEndIndex -= selectionLen;
          else if (startOffset === triggerStartIndex) cancelTrigger();
          else triggerEndIndex -= 1;
        } else if (startOffset < triggerEndIndex) triggerEndIndex -= 1;
        if (triggerEndIndex < startOffset) cancelTrigger();
      } else if (inputType.startsWith('history')) {
        // don't know what to do with historyUndo and historyRedo, just cancel trigger
        cancelTrigger();
      }
    },
    onInput(e: Event) {
      const { startOffset, startContainer, endContainer, endOffset } = getRangeInfo();
      console.log('startContainer', startContainer, startContainer.textContent, startOffset, endContainer, endOffset);
      const textNode = startContainer as Text,
        text = textNode.textContent!;
      console.log('text', text, lastDeleteStartIndex);

      if (lastDeleteStartIndex > -1) {
        content.value[lastDeleteStartIndex] = text;
        content.value.splice(lastDeleteStartIndex + 1, lastDeleteEndIndex - lastDeleteStartIndex);
      } else content.value[currentIndex] = text;

      console.log('content.value', content.value, text, startOffset);
      const { triggers, on } = info.value;
      const { onTrigger } = unrefOrGet(options);
      if (!on) return;
      const leadingText = text.substring(0, startOffset);
      if (lastTrigger) {
        const input = text.substring(triggerStartIndex, triggerEndIndex + compositionLen);
        console.log({ trigger: lastTrigger, input, textNode, startOffset, triggerEndIndex });
        if (!input) return;
        onTrigger && onTrigger({ trigger: lastTrigger, input, textNode });
      } else if ((lastTrigger = triggers.find((t) => leadingText.includes(t)))) {
        triggerEndIndex = triggerStartIndex = startOffset;
      }
    },
    onCompositionstart() {
      states.isComposing = true;
    },
    onCompositionupdate(e: CompositionEvent) {
      compositionLen = e.data?.length || 0;
    },
    onCompositionend() {
      states.isComposing = false;
      if (lastTrigger) {
        triggerEndIndex += compositionLen;
      }
      compositionLen = 0;
    },
    // can not be keydown, because range hasn't been updated yet in keydown
    onKeyup(e: KeyboardEvent) {
      checkIfCancelTrigger(e);
      if (isEnterDown(e) && lastTrigger) {
        e.preventDefault();
        cancelTrigger();
      }
    },
    // can not be pointerdown, because it can be selection
    onClick(e: MouseEvent) {
      checkIfCancelTrigger(e);
    },
    onBlur(e: FocusEvent) {
      checkIfCancelTrigger(e);
    },
  };

  return { render, handlers, editRef };
}
