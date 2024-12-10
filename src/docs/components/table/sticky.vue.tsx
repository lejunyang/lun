import { tableData } from 'data';

export default () => (
  <l-table data={tableData}>
    <l-table-column label="name" name="name" sticky></l-table-column>
    <l-table-column label="age" name="age" sticky="left"></l-table-column>
    <l-table-column name="tel" label="tel" headColSpan={2}></l-table-column>
    <l-table-column name="phone" label="phone"></l-table-column>
    <l-table-column name="address" label="address"></l-table-column>
    <l-table-column label="name" name="name"></l-table-column>
    <l-table-column name="tel" label="tel"></l-table-column>
    <l-table-column name="phone" label="phone"></l-table-column>
    <l-table-column label="age" name="age" sticky="right"></l-table-column>
    <l-table-column name="address" label="address"></l-table-column>
  </l-table>
);
