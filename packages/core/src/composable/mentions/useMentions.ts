import { UseInputOptions } from '../input';
import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils/ref';
import { useTempState } from '../../hooks/state';
import { isEnterDown, isHTMLElement, isString, toArrayIfNotNil } from '@lun/utils';
import { VNode, computed, h, reactive, readonly, watch } from 'vue';
import { rangeToString } from './utils';
import { useShadowEditable } from './useShadowEditable';
import { useCSSHighlight } from './useCSSHighlight';

export type MentionsTriggerParam = {
  trigger: string;
  input: string;
  text: string;
  startRange: Range;
  endRange: Range;
  startIndex: number;
  endIndex: number;
};

export type UseMentionsOptions = Pick<UseInputOptions, 'value'> & {
  triggers?: string[] | string | null;
  suffix?: string;
  onTrigger?: (param: MentionsTriggerParam) => void;
  /** called when triggering and pressed Enter */
  onCommit?: () => [string | null | undefined, string | null | undefined] | [string | null | undefined];
  onChange?: (param: { value: string; raw: readonly (string | MentionSpan)[] }) => void;
  onEnterDown?: (e: KeyboardEvent) => void;
  noOptions?: boolean;
  mentionRenderer?: (item: MentionSpan, necessaryProps: Record<string, any>) => VNode;
  triggerHighlight?: string;
};

export type MentionSpan = {
  trigger: string;
  label: string;
  value: string;
  suffix: string;
  actualLength: number;
};

function getRangeWithOffset(node: Node, start: number = 0, end?: number) {
  const range = document.createRange();
  range.setStart(node, start);
  range.setEnd(node, end ?? start);
  return range;
}

const allowedInputTypes = new Set([
  // insert
  'insertParagraph', // enter
  'insertLineBreak', // shift + enter
  'insertText',
  // 'insertReplacementText', // TODO insert or replace existing text by means of a spell checker, auto-correct, writing suggestions or similar
  'insertCompositionText',
  'insertFromPaste',
  // 'insertFromDrop', // TODO also needs to check rich text for it
  // delete
  // 'deleteContent', // don't know how to trigger it
  'deleteContentBackward', // win: backspace, mac: delete
  'deleteContentForward', // win: delete, mac: fn + delete
  'deleteWordBackward', // TODO test win: alt + backspace mac: option + delete
  'deleteWordForward',
  'deleteByCut', // ctrl + x or cmd + x
  'deleteByDrag',
  // how to support deleteSoftLineBackward deleteSoftLineForward
  // history
  'historyUndo', // ctrl + z or cmd + z
  'historyRedo', // ctrl + shift + z or cmd + shift + z
]);


// FIXME 在第一个例子中，使用箭头往右，在中间的时候按右却会往左。上下箭头表现不正常
// it's like https://issues.chromium.org/issues/41147311, 
// 在自定义渲染中，左右箭头无法在不同的编辑块中移动 Chrome
// FIXME firefox 最后位置输入trigger
export function useMentions(options: MaybeRefLikeOrGetter<UseMentionsOptions, true>) {
  const info = computed(() => {
    const { triggers, suffix } = unrefOrGet(options);
    const t = toArrayIfNotNil(triggers).filter(Boolean);
    return { triggers: t, suffix: suffix!, on: suffix && t.length };
  });
  let currentValue: string;
  //  valueNow = 'abc@he what' => ['abc', { trigger: '@', value: 'he', label: 'he', suffix: ' ', actualLength: 4 }, 'what']
  const content = useTempState(
    () => {
      const { on, triggers, suffix } = info.value;
      const { value } = unrefOrGet(options);
      const valueNow = String(unrefOrGet(value) || '');
      if (!on) return [valueNow];
      const regex = new RegExp(`(${triggers.join('|')})([^\\r\\n]+?)${suffix}`, 'g');
      let lastIndex = 0,
        match: RegExpExecArray | null;
      const content: (string | MentionSpan)[] = [];
      while ((match = regex.exec(valueNow)) !== null) {
        // equal to make sure push an empty string between two mention span
        if (match.index >= lastIndex) {
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
        } as MentionSpan);
        lastIndex = regex.lastIndex;
      }
      // equal to make sure push an empty string if the last one is mention
      if (lastIndex <= valueNow.length) {
        content.push(valueNow.substring(lastIndex));
      }
      return content;
    },
    {
      deepRef: true,
      shouldUpdate() {
        return unrefOrGet(unrefOrGet(options).value) !== currentValue;
      },
    },
  );
  watch(
    content,
    (val) => {
      const { onChange } = unrefOrGet(options);
      const raw = readonly(val);
      const value = raw.reduce<string>((res, current) => {
        if (isString(current)) return res + current;
        else {
          const { trigger, value, suffix } = current;
          return res + trigger + value + suffix;
        }
      }, '');
      onChange && onChange({ value, raw });
      currentValue = value;
    },
    { deep: true },
  );

  const render = computed(() => {
    const { mentionRenderer } = unrefOrGet(options);
    return content.value.map((item) => {
      // TODO try add &zwj; for last empty span, add padding-inline to fix firefox and safari cursor issue
      if (isString(item) || !item)
        return h(
          'span',
          {
            'data-is-text': '',
            part: 'text',
            // this is to fix cursor jump issue in chrome when using keyboard arrow to move cursor,
            style: 'display:inline-block',
          },
          item,
        );
      const necessaryProps = {
        'data-is-mention': '',
        contenteditable: 'false',
        part: 'mention',
      };
      if (mentionRenderer) return mentionRenderer(item, necessaryProps);
      return h(
        'span',
        {
          'data-trigger': item.trigger,
          'data-value': item.value,
          'data-suffix': item.suffix,
          ...necessaryProps,
        },
        item.label,
      );
    });
  });
  const isTextSpan = (el: any) => isHTMLElement(el) && 'isText' in el.dataset;

  const { editRef, requestFocus, getRange } = useShadowEditable();
  const [setHighlight, removeHighlight] = useCSSHighlight(() => unrefOrGet(options).triggerHighlight);

  const state = reactive({
    isComposing: false,
    lastTrigger: undefined as string | undefined,
    ignoreNextBlur: false,
  });
  let /** index of current editing element in editable children */ currentIndex = 0,
    /** trigger start caret index in the span's textContent */
    triggerStartIndex = 0,
    /** trigger end caret index in the span's textContent */
    triggerEndIndex = 0,
    /** length of current composition text */
    compositionLen = 0,
    lastTriggerParam: MentionsTriggerParam;
  const isBetweenTrigger = (index: number) => index >= triggerStartIndex && index <= triggerEndIndex;
  const cancelTrigger = () => {
    removeHighlight();
    state.lastTrigger = undefined;
    triggerStartIndex = triggerEndIndex = 0;
  };

  const getRangeInfo = () => {
    const { value } = editRef;
    const range = getRange();
    const { startContainer, endContainer, collapsed, startOffset } = range;
    let startIndex = -1,
      endIndex = -1;
    if (startContainer === value && collapsed && !startOffset) {
      // special case... if editRef is empty or we delete all text in first text span, the range startContainer will be editRef itself for no reason.
      // I try to reset selection and range to the first text span node, but it doesn't work, so just handle this case here
      startIndex = endIndex = 0;
    } else {
      const children = Array.from(value!.children);
      for (const i in children) {
        const el = children[i];
        // startContainer is Text node or span node
        if (el === startContainer.parentElement || el === startContainer) startIndex = +i;

        // endContainer is Text node
        if (el === endContainer.parentElement) endIndex = +i;
        // endContainer is span node
        // this could happen when dom is like this <span>text</span><span>@mention</span><span>text</span>
        // and then just select the mention span, the endContainer will be span.
        // if the span is a mention span, we'll consider endIndex is next text node; if the span is an empty text span, endIndex is itself
        else if (el === endContainer) endIndex = +i + (isTextSpan(el) ? 0 : 1);
        if (startIndex > -1 && endIndex > -1) break;
      }
    }

    return Object.assign(range, {
      /** index of startContainer's parent in editable div */
      startIndex,
      /** index of endContainer's parent in editable div */
      endIndex,
      // StaticRange doesn't have toString method...
      selectText: rangeToString(range),
    });
  };

  const checkIfCancelTrigger = (e?: KeyboardEvent | MouseEvent | FocusEvent) => {
    if (state.lastTrigger) {
      const { startIndex, endIndex, startOffset, endOffset } = getRangeInfo();
      let cancel = e?.type === 'blur';
      // !isBetweenTrigger(focusOffset)
      // can not use focusOffset of selection to determine is out of trigger, in safari, the selection will not pierce into shadow DOM
      cancel ||=
        endIndex !== currentIndex ||
        startIndex !== currentIndex ||
        !isBetweenTrigger(startOffset) ||
        !isBetweenTrigger(endOffset);
      if (cancel) cancelTrigger();
    }
  };

  const [recordInsertOrDelete, commitLastRecord] = (() => {
    let text = '',
      deleteStartIndex = 0,
      deleteEndIndex = 0,
      focusOffset = 0,
      recorded = false,
      willDeleteSpan = false;
    /**
     * record some information when it's about to delete span, it happens when:
     * 1. caret is at the beginning of a text node, the previous node is a mention span, then press backspace key, this is about to delete previous mention span
     * 2. caret is at the end of a text node, the next node is a mention span, then press delete key, this is about to delete next mention span
     * 3. there is a selection across many spans, then perform delete, input or paste something
     * 4. empty current text span, in chromium it will remove the span DOM also as it's empty, but that will lead to startContainer of range is the editRef, make onInput behave abnormal, so prevent this also
     * @param insertText text to be inserted, if not provided, it means delete
     * @param isForward whether this delete is forward
     * @returns whether this operation will delete mentions
     */
    const recordInsertOrDelete = (insertText?: string, isForward?: boolean) => {
      const { startOffset, startContainer, endOffset, endContainer, startIndex, endIndex, collapsed } = getRangeInfo();
      const endText = endContainer.textContent!,
        endTextLen = endText.length,
        isAcrossSpans = startIndex !== endIndex;
      // if startOffset === 0 && collapsed, it means the cursor is at the beginning of a text node, then if startIndex > 1, means the previous node is a mention span. it's about to delete the mention span
      // need a isForward flag because caret offset is not enough to determine whether is backward or forward when caret is between two mention spans
      const isBackDeleteMention = !isForward && !insertText && collapsed && startOffset === 0 && startIndex > 1,
        isForwardDeleteMention =
          !!isForward && !insertText && collapsed && endOffset === endTextLen && endIndex < content.value.length - 2;
      // it's about to empty the text span: isDelete && only one char left; isDelete && selectionLength === text's length
      const isEmptySpan =
        !insertText && (endTextLen === 1 || (!!endTextLen && endOffset - startOffset === endTextLen)) && !isAcrossSpans; // including selection case
      if (!insertText && collapsed && !isBackDeleteMention && !isForwardDeleteMention && !isEmptySpan)
        return (recorded = false);

      recorded = true;
      insertText ||= '';

      const textBefore = isBackDeleteMention
          ? content.value[startIndex - 2]
          : startContainer.textContent!.substring(0, startOffset),
        textAfter = isForwardDeleteMention ? content.value[endIndex + 2] : endText.substring(endOffset);
      text = isEmptySpan ? '' : textBefore + insertText + textAfter;
      deleteStartIndex = isBackDeleteMention ? startIndex - 2 : startIndex;
      deleteEndIndex = isForwardDeleteMention ? endIndex + 2 : endIndex;
      focusOffset = isEmptySpan ? 0 : (textBefore + insertText).length;
      return (willDeleteSpan = isAcrossSpans || isBackDeleteMention || isForwardDeleteMention || isEmptySpan);
    };
    const commitLastRecord = (commitOnlyDeleteSpan = false) => {
      if (!recorded || (commitOnlyDeleteSpan && !willDeleteSpan)) return false;
      recorded = false;
      // if deleteStartIndex !== deleteEndIndex, there must be at least a mention span in the range being deleted
      if (deleteStartIndex !== deleteEndIndex) {
        content.value.splice(deleteStartIndex, deleteEndIndex - deleteStartIndex + 1, text);
      } else {
        content.value[deleteStartIndex] = text;
      }
      requestFocus(deleteStartIndex, focusOffset);
      return true;
    };
    return [recordInsertOrDelete, commitLastRecord] as const;
  })();

  let handlers = {
    onBeforeinput(e: Event) {
      const { inputType, data, dataTransfer } = e as InputEvent;
      if (!allowedInputTypes.has(inputType)) return e.preventDefault();
      const isDelete = inputType.startsWith('delete'),
        isInsert = inputType.startsWith('insert'),
        isDeleteForward = inputType === 'deleteContentForward';

      const { startOffset, endIndex, selectText } = getRangeInfo();
      const selectionLen = selectText.length;
      const insertText = data || dataTransfer?.getData('text');

      currentIndex = endIndex;

      // when there is a selection, insert will also delete text
      if ((isDelete || (isInsert && selectionLen)) && recordInsertOrDelete(insertText, isDeleteForward)) {
        // originally I record it in beforeInput and commit it in input event, and I don't prevent beforeInput event, but it doesn't work in some cases
        // for example <span>text</span> <span>@mention1</span> <span>@mention2</span> <span>text2</span>
        // if select the mention1 and delete it, then both dom change and vue re-render happens, but result in <span>text</span> <span>text2</span> for unknown reason
        // so just prevent beforeInput if it's about to delete mention span, and commit it immediately
        e.preventDefault();
        commitLastRecord();
      }

      // below it's to updating triggerEndIndex
      if (!state.lastTrigger) return;
      // don't add the composition length to the triggerEndIndex here as text can be changed after composition ends, it needs to be handled in composition event
      if (isInsert && !state.isComposing) {
        const add = insertText?.length || 0;
        if (add || selectionLen) {
          triggerEndIndex += add;
          triggerEndIndex -= selectionLen; // if there is a selection in insert, the selection text will be deleted, it won't trigger another delete beforeInput
        }
      } else if (isDelete) {
        const isDeleteBackward = inputType === 'deleteContentBackward' || inputType === 'deleteByCut';
        // don't know what to do with other delete types, InputEvent.getTargetRanges always returns empty array in shadow DOM, don't know why, can only cancel trigger
        if (!isDeleteBackward && !isDeleteForward) return cancelTrigger();

        if (isDeleteBackward) {
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
    onInput() {
      const range = getRangeInfo();
      let { startOffset, startContainer } = range;
      let textNode = startContainer as Text,
        text = textNode.wholeText; // need to use wholeText other than textContent, as span may have multiple text nodes, especially when press Enter

      if (textNode.parentElement === editRef.value) {
        // refer to the comments in getRangeInfo, this is for that special case. At that time, startContainer is the first text node before first text span, the parent is the editRef
        textNode.textContent = ''; // clear current text node, will re-render it to the the first text span later
        const firstTextSpan = editRef.value.children[0];
        firstTextSpan.append(text);
        textNode = firstTextSpan.firstChild as Text; // must update textNode immediately, or later getRangeWithOffset will throw error
      }

      // it happens when press enter, there will be multiple text nodes in span
      if (text !== startContainer.textContent) {
        let temp: Node | null | undefined = startContainer;
        while ((temp = temp?.previousSibling)) {
          startOffset += temp.textContent!.length;
        }
      }
      content.value[currentIndex] = text;
      requestFocus(currentIndex, startOffset); // in chromium, caret will be in wrong position after press Enter; in safari, every edit can lead to wrong caret position

      const { triggers, on, suffix } = info.value;
      const { onTrigger, noOptions } = unrefOrGet(options);
      if (!on) return;
      const leadingText = text.substring(0, startOffset);
      if (!state.lastTrigger && (state.lastTrigger = triggers.find((t) => leadingText.endsWith(t)))) {
        triggerEndIndex = triggerStartIndex = startOffset;
      }
      if (state.lastTrigger) {
        const input = text.substring(triggerStartIndex, triggerEndIndex + compositionLen);
        if (noOptions && input.endsWith(suffix)) {
          return commit(input.slice(0, -suffix.length));
        }
        lastTriggerParam = {
          trigger: state.lastTrigger,
          input,
          text,
          startRange: getRangeWithOffset(textNode, triggerStartIndex),
          endRange: getRangeWithOffset(textNode, triggerEndIndex),
          startIndex: triggerStartIndex,
          endIndex: triggerEndIndex,
        };
        setHighlight(getRangeWithOffset(textNode, triggerStartIndex, triggerEndIndex));
        onTrigger && onTrigger(lastTriggerParam);
      }
    },
    onCompositionstart() {
      state.isComposing = true;
    },
    onCompositionupdate(e: CompositionEvent) {
      compositionLen = e.data?.length || 0;
    },
    onCompositionend() {
      state.isComposing = false;
      if (state.lastTrigger) {
        triggerEndIndex += compositionLen;
      }
      compositionLen = 0;
    },
    onKeydown(e: KeyboardEvent) {
      const { onCommit, onEnterDown } = unrefOrGet(options);
      if (isEnterDown(e)) {
        if (state.lastTrigger) {
          e.preventDefault();
          const [value, label] = (onCommit && onCommit()) || [];
          commit(value, label);
        } else if (!state.isComposing && onEnterDown) {
          onEnterDown(e);
        }
      }
    },
    // can not be keydown, because range hasn't been updated yet in keydown
    onKeyup(e: KeyboardEvent) {
      checkIfCancelTrigger(e);
    },
    // can not be pointerdown, because it can be selection
    onClick(e: MouseEvent) {
      checkIfCancelTrigger(e);
    },
    onBlur(e: FocusEvent) {
      // ignoreNextBlur is useful for pop content, as if we click the pop option, blur will definitely happen, so we need to ignore it once
      if (!state.ignoreNextBlur) checkIfCancelTrigger(e);
      else state.ignoreNextBlur = false;
    },
    onPaste(e: ClipboardEvent) {
      e.preventDefault();
      const text = e.clipboardData?.getData('text/plain') || '';
      recordInsertOrDelete(text);
      commitLastRecord();
    },
  };

  /** commit current trigger, update content value and generate new mention span */
  const commit = (value?: string | null, label?: string | null) => {
    if (!state.lastTrigger || value == null) return cancelTrigger();
    const { startIndex, endIndex, text, trigger } = lastTriggerParam!;
    const suffix = unrefOrGet(options).suffix!;
    const str1 = text.substring(0, startIndex - trigger.length),
      block: MentionSpan = {
        trigger,
        value,
        label: label ?? value,
        suffix,
        actualLength: trigger.length + value.length + suffix.length,
      },
      str2 = text.substring(endIndex);
    cancelTrigger();
    // even if str1 or str2 are empty string, they still needs to be inserted between two mention spans
    content.value.splice(currentIndex, 1, str1, block, str2);
    // focus on the new added block
    requestFocus(currentIndex + 2);
  };

  return { render, handlers, editRef, state, commit };
}
