import { tableColumnEmits, tableColumnProps, defineTableColumn, TableColumnProps, iTableColumn } from '@lun-web/components';
import createComponent from '../createComponent';

export const LTableColumn = createComponent<TableColumnProps, iTableColumn>('table-column', defineTableColumn, tableColumnProps, tableColumnEmits);
if (__DEV__) LTableColumn.displayName = 'LTableColumn';
