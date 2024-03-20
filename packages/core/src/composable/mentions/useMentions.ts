import { UseInputOptions, useInput } from '../input';
import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils/ref';
import { useTempState } from '../../hooks/state';
import { isEnterDown, isString, supportsPlaintextEditable, toArrayIfNotNil } from '@lun/utils';
import { Ref, computed, h, mergeProps, reactive, ref, watchEffect } from 'vue';

export type MentionsTriggerParam = {
  trigger: string;
  search: string;
  text: string;
  startRange: Range;
  endRange: Range;
  startIndex: number;
  endIndex: number;
};

export type UseMentionsOptions = UseInputOptions & {
  triggers?: string[] | string | null;
  suffix?: string;
  onTrigger?: (param: MentionsTriggerParam) => void;
  onCommit?: () => [string | null | undefined, string | null | undefined];
};

export type MentionBlock = {
  trigger: string;
  label: string;
  value: string;
  suffix: string;
  actualLength: number;
};

function getRangeOfText(textNode: Text, offset: number = 0) {
  const range = document.createRange();
  range.setStart(textNode, offset);
  range.setEnd(textNode, offset);
  return range;
}

export function useMentions(options: MaybeRefLikeOrGetter<UseMentionsOptions, true>) {
  const info = computed(() => {
    const { triggers, suffix } = unrefOrGet(options);
    const t = toArrayIfNotNil(triggers).filter(Boolean);
    return { triggers: t, suffix, on: suffix && t.length };
  });
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
      const content: (string | MentionBlock)[] = [];
      while ((match = regex.exec(valueNow)) !== null) {
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
    },
    { deep: true },
  );

  const render = computed(() => {
    return content.value.map((item) => {
      if (isString(item) || !item)
        return h(
          'span',
          {
            'data-is-text': '',
            part: 'text',
          },
          item,
        );
      return h(
        'span',
        {
          'data-is-mention': '',
          'data-trigger': item.trigger,
          'data-value': item.value,
          'data-suffix': item.suffix,
          contenteditable: 'false',
          part: 'mention',
        },
        item.label,
      );
    });
  });

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
  watchEffect(() => {
    const { value } = editRef;
    root.value = value?.getRootNode() as Document;
    localGetSelection = root.value?.getSelection?.bind(root.value) || document.getSelection.bind(document);
  });

  const state = reactive({
    isComposing: false,
    lastTrigger: undefined as string | undefined,
    ignoreNextBlur: false,
  });
  let currentIndex = 0,
    triggerStartIndex = 0,
    triggerEndIndex = 0,
    /** length of current composition text */
    compositionLen = 0,
    lastDeleteStartIndex = -1,
    lastDeleteEndIndex = 0,
    lastTriggerParam: MentionsTriggerParam,
    textBeforeLastDelete = '',
    textAfterLastDelete = '';
  const cancelTrigger = () => {
    console.log('canceled');
    state.lastTrigger = undefined;
    triggerStartIndex = triggerEndIndex = 0;
  };

  const getRangeInfo = () => {
    const { value } = editRef;
    const range = getRange();
    const { startContainer, endContainer } = range;
    let startIndex = -1,
      endIndex = -1;
    const children = Array.from(value!.children);
    for (const i in children) {
      const el = children[i];
      if (el === startContainer.parentElement) startIndex = +i;
      if (el === endContainer.parentElement) endIndex = +i;
      if (startIndex > -1 && endIndex > -1) break;
    }
    return Object.assign(range, {
      /** index of startContainer's parent in editable div */
      startIndex,
      /** index of endContainer's parent in editable div */
      endIndex,
    });
  };

  const checkIfCancelTrigger = (e: KeyboardEvent | MouseEvent | FocusEvent) => {
    if (state.lastTrigger) {
      const { focusOffset } = localGetSelection()!; // seems that endOffset is not always equal to focusOffset, startOffset counts
      let cancel = e.type === 'blur';
      cancel ||=
        focusOffset < triggerStartIndex || focusOffset > triggerEndIndex || getRangeInfo().endIndex !== currentIndex;
      if (cancel) cancelTrigger();
    }
  };

  let handlers = {
    onBeforeinput(_e: Event) {
      const { inputType, data, dataTransfer } = _e as InputEvent;
      const isDelete = inputType.startsWith('delete'),
        isInsert = inputType.startsWith('insert');
      const range = getRangeInfo();
      const selectionLen = range.toString().length;
      const { startOffset, startContainer, endOffset, endContainer, collapsed, startIndex, endIndex } = range;

      currentIndex = endIndex;

      // when there is a selection, insert will also delete text
      if (isDelete || (isInsert && selectionLen)) {
        // if startIndex !== endIndex, there must be at least a mention block in the range being deleted
        if (!collapsed && startIndex !== endIndex) {
          lastDeleteStartIndex = Math.min(startIndex, endIndex);
          lastDeleteEndIndex = Math.max(startIndex, endIndex);
          textBeforeLastDelete = startContainer.textContent!.substring(0, startOffset);
          textAfterLastDelete = endContainer.textContent!.substring(endOffset);
          console.log('textAfterLastDelete', textAfterLastDelete);
        } else if (collapsed && startOffset === 0) {
          // if startOffset === 0, it means the cursor is at the beginning of a text node, and the previous node is a mention block
          lastDeleteStartIndex = currentIndex - 2; // currentIndex === 0 won't bother it, lastDeleteStartIndex > -1 will be checked in onInput
          lastDeleteEndIndex = currentIndex;
          textBeforeLastDelete = '';
          textAfterLastDelete = endContainer.textContent!;
        }
      } else lastDeleteStartIndex = -1;

      console.log('e', inputType, data, { startIndex, endIndex, collapsed });

      // below it's to updating triggerEndIndex
      if (!state.lastTrigger) return;
      // don't add the composition length to the triggerEndIndex here as text can be changed after composition ends, it needs to be handled in composition event
      if (isInsert && !state.isComposing) {
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
      const range = getRangeInfo();
      const { startOffset, startContainer } = range;
      const textNode = startContainer as Text,
        text = textNode.textContent!;

      console.log('input currentIndex', currentIndex, text);
      if (lastDeleteStartIndex > -1) {
        content.value.splice(
          lastDeleteStartIndex,
          lastDeleteEndIndex - lastDeleteStartIndex + 1,
          textBeforeLastDelete + text + textAfterLastDelete,
        );
        requestFocus(lastDeleteStartIndex, (textBeforeLastDelete + text).length);
      } else content.value[currentIndex] = text;

      console.log('content.value', content.value, text, startOffset);
      const { triggers, on } = info.value;
      const { onTrigger } = unrefOrGet(options);
      if (!on) return;
      const leadingText = text.substring(0, startOffset);
      if (!state.lastTrigger && (state.lastTrigger = triggers.find((t) => leadingText.includes(t)))) {
        triggerEndIndex = triggerStartIndex = startOffset;
      }
      if (state.lastTrigger) {
        const search = text.substring(triggerStartIndex, triggerEndIndex + compositionLen);
        lastTriggerParam = {
          trigger: state.lastTrigger,
          search,
          text,
          startRange: getRangeOfText(textNode, triggerStartIndex),
          endRange: getRangeOfText(textNode, triggerEndIndex),
          startIndex: triggerStartIndex,
          endIndex: triggerEndIndex,
        };
        console.log(lastTriggerParam);
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
      const { onCommit } = unrefOrGet(options);
      if (isEnterDown(e) && state.lastTrigger) {
        e.preventDefault();
        const [value, label] = (onCommit && onCommit()) || [];
        commit(value, label);
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
      if (!state.ignoreNextBlur) checkIfCancelTrigger(e);
      else state.ignoreNextBlur = false;
    },
    onPaste(e: ClipboardEvent) {
      e.preventDefault();
      const range = getRangeInfo();
      const selectionLen = range.toString().length;
      const text = e.clipboardData?.getData('text/plain') || '';
      const { startOffset, startContainer, endOffset, endContainer, startIndex, endIndex } = range;
      if (!text && !selectionLen) return;
      const textBefore = startContainer.textContent!.substring(0, startOffset),
        textAfter = endContainer.textContent!.substring(endOffset);
      console.log('paste', {
        startOffset,
        startContainer,
        endOffset,
        endContainer,
        startIndex,
        endIndex,
        textBefore,
        textAfter,
      });
      if (startIndex !== endIndex) {
        content.value.splice(startIndex, endIndex - startIndex + 1, textBefore + text + textAfter);
      } else {
        content.value[startIndex] = textBefore + text + textAfter;
      }
      requestFocus(startIndex, (textBefore + text).length);
    },
  };
  if (!supportsPlaintextEditable()) {
    handlers = mergeProps(handlers, {
      onKeydown(e: KeyboardEvent) {
        if (e.ctrlKey || e.metaKey) {
          switch (e.key) {
            case 'b': //ctrl+B or ctrl+b
            case 'B':
            case 'i': //ctrl+I or ctrl+i
            case 'I':
            case 'u': //ctrl+U or ctrl+u
            case 'U': {
              e.preventDefault();
              break;
            }
          }
        }
      },
    }) as any;
  }

  const requestFocus = (index: number, offset: number = 0) => {
    requestAnimationFrame(() => {
      const { value } = editRef;
      if (!value) return;
      const el = value.children[index]?.firstChild as Text;
      if (!el) return;
      const newRange = getRangeOfText(el, offset);
      const selection = localGetSelection()!;
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    });
  };

  const commit = (value?: string | null, label?: string | null) => {
    if (!state.lastTrigger || value == null) return cancelTrigger();
    const { startIndex, endIndex, text, trigger } = lastTriggerParam!;
    const suffix = unrefOrGet(options).suffix!;
    const str1 = text.substring(0, startIndex - trigger.length),
      block: MentionBlock = {
        trigger,
        value,
        label: label ?? value,
        suffix,
        actualLength: trigger.length + value.length + suffix.length,
      },
      str2 = text.substring(endIndex);
    cancelTrigger();
    // even if str1 or str2 are empty string, they still needs to be inserted between two blocks, so that we can edit between them
    content.value.splice(currentIndex, 1, str1, block, str2);
    // focus on the new added block
    requestFocus(currentIndex + 2);
    console.log('commit content.value', content.value);
  };

  return { render, handlers, editRef, state, commit };
}
