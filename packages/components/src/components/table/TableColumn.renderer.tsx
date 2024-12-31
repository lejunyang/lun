import { getProp, renderElement } from 'utils';
import { GetCustomRendererSource } from '../custom-renderer';
import { isFunction, objectGet } from '@lun-web/utils';
import { renderCustom } from '../custom-renderer/CustomRenderer';
import { InternalColumn, InternalTableColumnRendererParams } from './internalType';
import { TableExternalContext } from './collector';

const radioSelectType = 'radio-select' as const,
  checkboxSelectType = 'checkbox-select' as const;

const getSelectRenderer =
  (comp: 'radio' | 'checkbox' = 'radio') =>
  ({ key, context }: InternalTableColumnRendererParams) =>
    renderElement(comp, {
      checked: context.rowSelect.isSelected(key),
      onUpdate() {
        context.rowSelect[comp === 'radio' ? 'select' : 'toggle'](key);
      },
    })!;

export const tableColumnRendererRegistry: Record<
  string,
  (params: InternalTableColumnRendererParams) => GetCustomRendererSource
> = {
  index: ({ index }) => index + 1,
  [radioSelectType]: getSelectRenderer(),
  [checkboxSelectType]: getSelectRenderer('checkbox'),
};

const common = {
  width: 50,
  justify: 'center' as const,
};

export const TABLE_INDEX_COLUMN = { type: 'index' as const, ...common, sticky: true };

export const TABLE_RADIO_SELECT_COLUMN = {
  type: radioSelectType,
  ...common,
};

export const TABLE_CHECKBOX_SELECT_COLUMN = {
  type: checkboxSelectType,
  ...common,
  header: ({ context: { rowSelectionState, rowSelect } }: { context: TableExternalContext }) =>
    renderElement('checkbox', {
      checked: rowSelectionState.allSelected,
      intermediate: rowSelectionState.intermediate,
      onUpdate(e: CustomEvent<{ checked: boolean }>) {
        if (e.detail.checked) rowSelect.selectAll();
        else rowSelect.unselectAll();
      },
    }),
};

export const renderCell = (
  column: InternalColumn,
  rowIndex: number,
  rowKey: any,
  rowData: unknown,
  columnProps: any,
  context: TableExternalContext,
) => {
  const value = objectGet(rowData, getProp(column, 'name')),
    renderer = getProp(column, 'renderer'),
    type = getProp(column, 'type'),
    commonRenderer = type && tableColumnRendererRegistry[type];
  const params = { value, index: rowIndex, key: rowKey, row: rowData, props: columnProps, context };
  return isFunction(renderer)
    ? renderCustom(renderer(params))
    : commonRenderer
    ? renderCustom(commonRenderer(params))
    : value;
};
