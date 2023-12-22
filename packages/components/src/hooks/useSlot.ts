import { ref, watch } from 'vue';

export function useSlot(props?: any) {
  const slotRef = ref<HTMLSlotElement>();
  const slotted = ref(false);
  const onSlotchange = () => {
    const el = slotRef.value;
    if (el?.assignedNodes().length) {
      slotted.value = true;
    } else {
      slotted.value = false;
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
    slotProps,
  };
}
