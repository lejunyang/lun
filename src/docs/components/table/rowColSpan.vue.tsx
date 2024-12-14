import { tableData } from 'data';

export default () => (
  <l-table data={tableData}>
    <l-table-column
      header="name"
      name="name"
      cellProps={(_, index) => (index === 0 ? { rowSpan: 2 } : {})}
    ></l-table-column>
    <l-table-column header="age" name="age"></l-table-column>
    <l-table-column name="tel" header="tel" headerColSpan={2}></l-table-column>
    <l-table-column
      name="phone"
      header="phone"
      cellProps={(_, index) => (index === 2 ? { colSpan: 2, rowSpan: 2 } : {})}
    ></l-table-column>
    <l-table-column name="address" header="address"></l-table-column>
  </l-table>
);
