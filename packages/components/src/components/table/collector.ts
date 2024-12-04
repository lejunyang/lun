import { createCollector } from '@lun-web/core';
import { TableProps, TableSetupProps } from './type';
import { getCollectorOptions } from 'common';

export type TableProvideExtra = {
  a: 1;
};

export const TableColumnCollector = createCollector<TableProps, TableSetupProps, TableProvideExtra, true>({
  ...getCollectorOptions('table', true),
  tree: true,
});
