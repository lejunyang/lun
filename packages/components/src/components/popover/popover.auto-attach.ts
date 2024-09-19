import { PopoverAttachTargetOptions } from '@lun/core';
import { on } from '@lun/utils';
import { ref, watch } from 'vue';

export function useAutoAttach(
  props: { autoAttachAttr?: string },
  methods: { attachTarget(target?: Element, options?: PopoverAttachTargetOptions): void },
) {
  const slotRef = ref<HTMLSlotElement>();
  watch(slotRef, (slot) => {
    if (slot) {
      const check = () => {
        const { autoAttachAttr } = props;
        if (!autoAttachAttr) return;
        slot.assignedElements().forEach((e) => {
          const slotName = e.getAttribute(autoAttachAttr);
          if (slotName) methods.attachTarget(e, { slotName });
        });
      };
      check();
      on(slot, 'slotchange', check);
    }
  });
  return slotRef;
}
