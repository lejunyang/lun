import { tableEmits, tableProps, defineTable, TableProps, iTable } from '@lun-web/components';
import createComponent from '../createComponent';

export const LTable = createComponent<TableProps, iTable>('table', defineTable, tableProps, tableEmits);
if (__DEV__) LTable.displayName = 'LTable';
