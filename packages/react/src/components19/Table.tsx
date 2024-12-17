import { defineTable, TableProps, iTable } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LTable = createComponent<TableProps, iTable>('table', defineTable);
if (__DEV__) LTable.displayName = 'LTable';
