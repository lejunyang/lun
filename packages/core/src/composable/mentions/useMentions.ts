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

  const getCurrentCaretInfo = () => {
    const { startContainer, startOffset } = getRange();
    const parent = startContainer.parentNode!;
    parent.normalize();
    const index = Array.from(parent.childNodes).indexOf(startContainer as any);
    return { startContainer, startOffset, index };
  };

  const checkIfCancelTrigger = (e: KeyboardEvent | MouseEvent) => {
    if (lastTrigger) {
      const { startOffset } = getRange();
      let cancel = false;
      if (e.type === 'keydown') {
        const { key } = e as KeyboardEvent;
        const logicalLeft = states.isRTL ? key === 'ArrowRight' : key === 'ArrowLeft',
          logicalRight = states.isRTL ? key === 'ArrowLeft' : key === 'ArrowRight';
        cancel = logicalRight || (logicalLeft && startOffset < triggerStartIndex);
      } else if (e.type === 'pointerdown') {
        const { startOffset, index } = getCurrentCaretInfo();
        cancel = index !== currentIndex || startOffset < triggerStartIndex; // FIXME 这个没有测试通过
      }
      if (cancel) {
        console.log('canceled');
        lastTrigger = undefined;
        triggerStartIndex = triggerEndIndex = 0;
      }
    }
  };

  // FIXME 选择文本如果选到了mention的文本，然后删除会有问题
  const handlers = {
    onBeforeinput(e: Event) {
      const { startContainer, startOffset } = getRange();
      const parent = startContainer.parentNode!;
      parent.normalize();
      // we should get the index in beforeinput event, as in input event we can get wrong index in this way
      // for example, if we press enter, it will create a new text node, and the index of startContainer will not be the correct index of content.value
      currentIndex = Array.from(parent.childNodes).indexOf(startContainer as any);
      console.log('before input index', currentIndex, startContainer.textContent);
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
        // FIXME 删除字符的时候 startOffset比它小，应该在beforeInput里面处理
        if (startOffset > triggerEndIndex) triggerEndIndex = startOffset; // 如果是正常编辑，那么startOffset每次都会比triggerEndIndex大，但是如果往左移动了光标则不然，此时不更新
        const input = text.substring(triggerStartIndex, triggerEndIndex);
        console.log({ trigger: lastTrigger, input, textNode });
        if (!input) return;
        onTrigger && onTrigger({ trigger: lastTrigger, input, textNode });
      } else if ((lastTrigger = triggers.find((t) => leadingText.includes(t)))) {
        triggerStartIndex = startOffset;
      }
    },
    onKeydown(e: KeyboardEvent) {
      // 如果正在triggering，如果是按右箭头（需要考虑rtl吗），则取消triggering；如果是按左箭头，获取当前光标位置，如果小于triggerStartIndex，则取消triggering
      checkIfCancelTrigger(e);
      if (isEnterDown(e)) {
        // e.preventDefault();
      }
    },
    onPointerdown(e: MouseEvent) {
      checkIfCancelTrigger(e);
    },
  };

  return { render, handlers, editRef };
}
