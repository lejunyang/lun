import { createCollector } from '@lun-web/core';
import { getCollectorOptions } from 'common';
import { TabItemProps, TabsProps } from './type';

export type TabsProvide = {
  isActive: (slot?: string, index?: number) => boolean;
  getTransitionName: () => string;
  transitionEnd: () => void;
};

export const TabsCollector = createCollector<TabsProps, TabItemProps, TabsProvide>(getCollectorOptions('tabs', true));
