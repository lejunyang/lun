import { ref, watch } from 'vue';

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
