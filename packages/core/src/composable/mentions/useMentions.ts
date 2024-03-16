import { UseInputOptions, useInput } from '../input';
import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils/ref';
import { useTempState } from '../../hooks/state';
import { isEnterDown, isString, toArrayIfNotNil } from '@lun/utils';
import { Ref, h, ref, watchEffect } from 'vue';

export type UseMentionsOptions = UseInputOptions & {
  triggers?: string[] | string | null;
  suffix?: string;
};

export type MentionBlock = {
  trigger: string;
  label: string;
  value: any;
  suffix: string;
  actualLength: number;
};

export function useMentions(options: MaybeRefLikeOrGetter<UseMentionsOptions, true>) {
  //  valueNow = 'abc@he- i don +1- what'
  const content = useTempState(() => {
    const { value, triggers, suffix } = unrefOrGet(options);
    const valueNow = String(unrefOrGet(value) || '');
    const triggersArr = toArrayIfNotNil(triggers);
    if (!triggersArr.length || !suffix) return [valueNow];
    const regex = new RegExp(`(${triggersArr.join('|')})([^\\r\\n]+?)${suffix}`, 'g');
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
          'data-trigger': item.trigger,
          'data-suffix': item.suffix,
          contenteditable: 'false',
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
  watchEffect(() => {
    root.value = editRef.value?.getRootNode() as Document;
    localGetSelection = root.value?.getSelection?.bind(root.value) || document.getSelection.bind(document);
  });

  let currentIndex = 0;
  const handlers = {
    onBeforeinput(e: Event) {
      const { startContainer } = getRange();
      const parent = startContainer.parentNode!;
      parent.normalize();
      // we should get the index in beforeinput event, as in input event we can get wrong index in this way
      // for example, if we press enter, it will create a new text node, and the index of startContainer will not be the correct index of content.value
      currentIndex = Array.from(parent.childNodes).indexOf(startContainer as any);
      console.log('before input index', currentIndex);
    },
    onInput(e: Event) {
      const { startContainer } = getRange();
      const parent = startContainer.parentNode!;
      parent.normalize();
      content.value[currentIndex] = parent.childNodes[currentIndex].textContent!;
      console.log('content.value', content.value);
    },
    onKeydown(e: KeyboardEvent) {
      if (isEnterDown(e)) {
        // e.preventDefault();
      }
    },
  };

  return { render, handlers, editRef };
}
