import { h, onBeforeUnmount, ref, watch, watchEffect } from 'vue';
import { useShadowDom } from './shadowDom';
import { isElement, isSupportSlotAssign, isText } from '@lun/utils';
import { MaybeRefLikeOrGetter, unrefOrGet } from '@lun/core';

export function useSlot(props?: any) {
  const slotRef = ref<HTMLSlotElement>();
  const slotted = ref(false);
  const empty = ref(true);
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
  const slotProps = {
    ...props,
    ref: slotRef,
    onSlotchange,
  };
  watch(slotRef, onSlotchange);
  return {
    slotRef,
    slotted,
    empty,
    slotProps,
  };
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
        ? Array.from(CE.children).filter((i) => i.slot === name)
        : Array.from(CE.childNodes).filter((i) => isElement(i) || isText(i))
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
