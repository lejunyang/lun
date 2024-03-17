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
    return content.value.map((item) => {
      if (isString(item) || !item) return item;
      return h(
        'span',
        {
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
    triggerEndIndex = 0;
  const cancelTrigger = () => {
    console.log('canceled');
    lastTrigger = undefined;
    triggerStartIndex = triggerEndIndex = 0;
  };

  const getCurrentCaretInfo = () => {
    const { startContainer, startOffset } = getRange();
    const parent = startContainer.parentNode!;
    parent.normalize();
    const index = Array.from(parent.childNodes).indexOf(startContainer as any);
    return { startContainer, startOffset, index };
  };

  const checkIfCancelTrigger = (e: KeyboardEvent | MouseEvent | FocusEvent) => {
    if (lastTrigger) {
      const { endOffset } = getRange();
      let cancel = e.type === 'blur';
      if (e.type === 'keyup') {
        const { key } = e as KeyboardEvent;
        const logicalLeft = states.isRTL ? key === 'ArrowRight' : key === 'ArrowLeft',
          logicalRight = states.isRTL ? key === 'ArrowLeft' : key === 'ArrowRight';
        cancel = (logicalRight && endOffset > triggerEndIndex) || (logicalLeft && endOffset < triggerStartIndex);
      } else if (e.type === 'click') {
        const { index } = getCurrentCaretInfo();
        cancel = index !== currentIndex || endOffset < triggerStartIndex;
      }
      if (cancel) cancelTrigger();
    }
  };

  // FIXME 选择文本如果选到了mention的文本，然后删除会有问题
  const handlers = {
    onBeforeinput(_e: Event) {
      const { inputType, data, dataTransfer, isComposing } = _e as InputEvent;
      const range = getRange();
      const { startContainer, startOffset } = range;
      const parent = startContainer.parentNode!;
      parent.normalize();
      // we should get the index in beforeinput event, as in input event we can get wrong index in this way
      // for example, if we press enter, it will create a new text node, and the index of startContainer will not be the correct index of content.value
      currentIndex = Array.from(parent.childNodes).indexOf(startContainer as any);
      console.log('before input index', currentIndex, startContainer.textContent, inputType);

      if (!lastTrigger) return;
      if (inputType.startsWith('insert') && startOffset < triggerEndIndex) {
        const add = data?.length || dataTransfer?.getData('text').length;
        console.log('add', add, data, dataTransfer?.getData('text'));
        if (add) triggerEndIndex += add;
      } else if (inputType.startsWith('delete')) {
        const isContentForward = inputType === 'deleteContentForward',
          isContentBackward = inputType === 'deleteContentBackward';
        // don't know what to do with other delete types, InputEvent.getTargetRanges always returns empty array in shadow DOM, don't know why, can only cancel trigger
        if (!isContentBackward && !isContentForward) return cancelTrigger();
        const selectionText = range.toString();
        console.log('selectionText', selectionText, selectionText.length);
        if (isContentBackward) {
          if (selectionText.length) triggerEndIndex -= selectionText.length;
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
      const { startContainer, startOffset } = getRange();
      const parent = startContainer.parentNode!;
      parent.normalize();
      const textNode = parent.childNodes[currentIndex] as Text,
        text = textNode.textContent!;
      content.value[currentIndex] = text;
      console.log('content.value', content.value, text, startOffset);
      const { triggers, on } = info.value;
      const { onTrigger } = unrefOrGet(options);
      if (!on) return;
      const leadingText = text.substring(0, startOffset);
      if (lastTrigger) {
        if (startOffset > triggerEndIndex) triggerEndIndex = startOffset; // means it's appending text, update the triggerEndIndex
        const input = text.substring(triggerStartIndex, triggerEndIndex);
        console.log({ trigger: lastTrigger, input, textNode, startOffset, triggerEndIndex });
        if (!input) return;
        onTrigger && onTrigger({ trigger: lastTrigger, input, textNode });
      } else if ((lastTrigger = triggers.find((t) => leadingText.includes(t)))) {
        triggerStartIndex = startOffset;
      }
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
