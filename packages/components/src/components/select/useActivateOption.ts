import { CollectorParentReturn, MaybeRefLikeOrGetter, unrefOrGet } from '@lun/core';
import { ref, ComponentInternalInstance, watchEffect, computed } from 'vue';

export function useActivateOption(
  collectorParent: CollectorParentReturn,
  params: MaybeRefLikeOrGetter<{ upDownToggle?: boolean; autoActivateFirst?: boolean }>,
) {
  const activeIndex = ref();
  const isNotAllDisabled = computed(() => {
    return collectorParent.value.some((vm) => !vm.exposed?.disabled);
  });
  const firstSelectedIndex = computed(() => collectorParent.value.findIndex((vm) => vm.exposed?.selected));
  const methods = {
    isActive(vm: ComponentInternalInstance) {
      return activeIndex.value != null && activeIndex.value === collectorParent.getChildVmIndex(vm);
    },
    activate(vm: ComponentInternalInstance) {
      const index = collectorParent.getChildVmIndex(vm);
      if (index !== undefined) activeIndex.value = index;
    },
    isValidNow() {
      const vmNow = collectorParent.value[activeIndex.value];
      return vmNow && !vmNow.exposed?.disabled;
    },
    activateNext() {
      const { value } = activeIndex;
      const { length } = collectorParent.value;
      if (value == null || value === length - 1) activeIndex.value = 0;
      else if (value < length - 1) activeIndex.value++;
      // need to check if it is all disabled, or it may lead to a dead loop
      if (isNotAllDisabled.value && !methods.isValidNow()) methods.activateNext();
    },
    activatePrev() {
      const { value } = activeIndex;
      const { length } = collectorParent.value;
      if (value == null || value === 0) activeIndex.value = length - 1;
      else if (value > 0) activeIndex.value--;
      if (isNotAllDisabled.value && !methods.isValidNow()) methods.activatePrev();
    },
    resetIndex() {
      if (!isNotAllDisabled.value) {
        activeIndex.value = null;
        return;
      }
      // if there is a selected option, activate it, or activate the first option according to the autoActivateFirst prop
      if (firstSelectedIndex.value !== -1) {
        activeIndex.value = firstSelectedIndex.value;
        return;
      }
      if (unrefOrGet(params)?.autoActivateFirst && activeIndex.value == null && collectorParent.value.length) {
        methods.activateNext();
      }
    },
  };
  const handlers = {
    onKeydown(e: KeyboardEvent) {
      if (!unrefOrGet(params)?.upDownToggle || !isNotAllDisabled.value) return;
      if (e.key === 'ArrowDown') {
        methods.activateNext();
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        methods.activatePrev();
        e.preventDefault();
      }
    },
  };
  watchEffect(methods.resetIndex);
  return { activeIndex, methods, handlers };
}
