import { getProp } from 'utils';
import { GetCustomRendererSource } from '../custom-renderer';
import { isFunction, objectGet } from '@lun-web/utils';
import { renderCustom } from '../custom-renderer/CustomRenderer';
import { InternalColumn } from './internalType';

export const tableColumnRendererRegistry: Record<
  string,
  (value: unknown, rowIndex: number, rowData: unknown, columnProps: any) => GetCustomRendererSource
> = {
  index: (_, index) => index + 1,
};

export const TABLE_INDEX_COLUMN = { type: 'index' as const, width: 50, justify: 'center' as const, sticky: true };

export const renderCell = (column: InternalColumn, rowIndex: number, rowData: unknown, columnProps: any) => {
  const value = objectGet(rowData, getProp(column, 'name')),
    renderer = getProp(column, 'renderer'),
    type = getProp(column, 'type'),
    commonRenderer = type && tableColumnRendererRegistry[type];
  return isFunction(renderer)
    ? renderCustom(renderer(value, rowIndex, rowData, columnProps))
    : commonRenderer
    ? renderCustom(commonRenderer(value, rowIndex, rowData, columnProps))
    : value;
};
