import { createCollector } from '@lun/core';
import { getCollectorOptions } from 'common';
import { TabItemProps, TabsProps } from './type';

export type TabsProvide = {
  isActive: (slot?: string, index?: number) => boolean;
};

export const TabsCollector = createCollector<TabsProps, TabItemProps, TabsProvide>(getCollectorOptions('tabs', true));
