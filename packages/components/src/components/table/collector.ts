import { createCollector, useWeakSet } from '@lun-web/core';
import { TableSetupProps, TableColumnSetupProps } from './type';
import { getCollectorOptions } from 'common';
import { ComponentInternalInstance } from 'vue';

export type TableProvideExtra = {
  maxLevel: () => number;
  collapsed: ReturnType<typeof useWeakSet<ComponentInternalInstance>>;
};

export const TableColumnCollector = createCollector<TableSetupProps, TableColumnSetupProps, TableProvideExtra, true>({
  ...getCollectorOptions('table', true),
  tree: true,
});
