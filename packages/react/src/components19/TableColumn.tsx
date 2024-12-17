import { defineTableColumn, TableColumnProps, iTableColumn } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LTableColumn = createComponent<TableColumnProps, iTableColumn>('table-column', defineTableColumn);
if (__DEV__) LTableColumn.displayName = 'LTableColumn';
