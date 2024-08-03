import { createCollector, getHostOfRootShadow } from '@lun/core';
import { Ref } from 'vue';

export type TabsProvide = {
  active: Ref<string>;
};

export const TabsCollector = createCollector({
  sort: true,
  getChildEl: getHostOfRootShadow,
  parentExtra: 1 as any as TabsProvide,
});
