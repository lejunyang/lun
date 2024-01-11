import { CollectorParentReturn, MaybeRefLikeOrGetter, unrefOrGet } from '@lun/core';
import { ref, ComponentInternalInstance, watchEffect, computed } from 'vue';

export function useActivateOption(
  collectorParent: CollectorParentReturn,
  params: MaybeRefLikeOrGetter<{ upDownToggle?: boolean; autoActivateFirst?: boolean }>,
) {
  const activeIndex = ref<number | undefined | null>();
  const isNotAllDisabled = computed(() => {
    return collectorParent.value.some((vm) => !vm.exposed?.disabled);
  });
  const firstSelectedIndex = computed(() => collectorParent.value.findIndex((vm) => vm.exposed?.selected));
  const deactivate = () => (activeIndex.value = null);
  const methods = {
    isActive(vm: ComponentInternalInstance) {
      return activeIndex.value != null && activeIndex.value === collectorParent.getChildVmIndex(vm);
    },
    getActiveChild() {
      return collectorParent.value[activeIndex.value!];
    },
    activate(vm: ComponentInternalInstance) {
      const index = collectorParent.getChildVmIndex(vm);
      if (index !== undefined) activeIndex.value = index;
    },
    deactivate,
    isValidNow() {
      const vmNow = methods.getActiveChild();
      return vmNow && !vmNow.exposed?.disabled && !vmNow.exposed?.hidden;
    },
    activateNext() {
      const { value } = activeIndex;
      const { length } = collectorParent.value;
      if (value == null || value === length - 1) activeIndex.value = 0;
      else if (value < length - 1) activeIndex.value!++;
      // need to check if it is all disabled, or it may lead to a dead loop
      if (isNotAllDisabled.value && !methods.isValidNow()) methods.activateNext();
    },
    activatePrev() {
      const { value } = activeIndex;
      const { length } = collectorParent.value;
      if (value == null || value === 0) activeIndex.value = length - 1;
      else if (value > 0) activeIndex.value!--;
      if (isNotAllDisabled.value && !methods.isValidNow()) methods.activatePrev();
    },
    activateCurrentSelected() {
      if (firstSelectedIndex.value !== -1) {
        return (activeIndex.value = firstSelectedIndex.value);
      } else return -1;
    },
    initIndex() {
      if (!isNotAllDisabled.value) {
        activeIndex.value = undefined;
        return;
      }
      if (activeIndex.value !== undefined) return;
      // if there is a selected option, activate it, or activate the first option according to the autoActivateFirst prop
      if (methods.activateCurrentSelected() !== -1) {
        return;
      }
      if (unrefOrGet(params)?.autoActivateFirst && collectorParent.value.length) {
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
  watchEffect(methods.initIndex);
  return { activeIndex, methods, handlers };
}
