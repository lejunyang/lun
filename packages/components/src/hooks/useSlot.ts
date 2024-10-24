import { h, onBeforeUnmount, ref, shallowRef, watch, watchEffect } from 'vue';
import { useShadowDom } from './shadowDom';
import { arrayFrom, isElement, isSupportSlotAssign, isText, isTruthyOrZero } from '@lun/utils';
import { MaybeRefLikeOrGetter, unrefOrGet } from '@lun/core';
import { renderCustom } from '../components/custom-renderer/CustomRenderer';

/**
 * @param name
 * @returns [getSlotNode, empty, slotted, slotRef]
 */
export function useSlot(name?: MaybeRefLikeOrGetter<string>, getCustomContent?: MaybeRefLikeOrGetter<any>) {
  const slotRef = ref<HTMLSlotElement>(),
    slotted = ref(false),
    empty = ref(true),
    contentRef = shallowRef();
  const onSlotchange = () => {
    const el = slotRef.value;
    if (el?.assignedNodes().length) {
      slotted.value = true;
      empty.value = false;
    } else {
      slotted.value = false;
      empty.value = !el?.childNodes.length;
    }
  };

  getCustomContent &&
    watchEffect(() => {
      const content = unrefOrGet(getCustomContent);
      if (isTruthyOrZero(content)) {
        contentRef.value = content;
        slotted.value = true;
        empty.value = false;
      }
    });

  watch(slotRef, onSlotchange);
  return [
    (children?: any) => {
      if (contentRef.value) return renderCustom(contentRef.value);
      return h(
        'slot',
        {
          name: unrefOrGet(name),
          ref: slotRef,
          onSlotchange,
        },
        children!,
      );
    },
    empty,
    slotted,
    slotRef,
  ] as const;
}

export function useManualSlot(
  target: MaybeRefLikeOrGetter<Element>,
  name?: string,
  isOn?: MaybeRefLikeOrGetter<boolean>,
) {
  const slotRef = ref<HTMLSlotElement>();
  const render = () => h('slot', { name, ref: slotRef });
  if (!isSupportSlotAssign()) return render;
  let last: Node[] = [];

  const clear = () => {
    last.forEach((i) => i.parentNode?.removeChild(i));
    last = [];
  };

  const init = () => {
    const { value } = slotRef;
    const { CE } = shadow;
    if (!value || !CE) return;
    const toBeSlotted = (last = (
      name
        ? arrayFrom(CE.children).filter((i) => i.slot === name)
        : arrayFrom(CE.childNodes).filter((i) => isElement(i) || isText(i))
    ).map((i) => i.cloneNode(true) as Element | Text));
    unrefOrGet(target)?.append(...toBeSlotted);
    value.assign(...toBeSlotted);
  };
  const ob = new MutationObserver(() => {
    clear();
    init();
  });
  const shadow = useShadowDom();
  watchEffect(() => {
    const { CE } = shadow;
    if (unrefOrGet(isOn) && CE && slotRef.value) {
      ob.observe(CE, { childList: true, subtree: true });
      init();
    } else {
      ob.disconnect();
      clear();
    }
  });
  onBeforeUnmount(() => {
    ob.disconnect();
    clear();
  });
  return render;
}
