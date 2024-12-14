import { tableData } from 'data';

export default () => (
  <l-table data={tableData}>
    <l-table-column header="name" name="name" sticky></l-table-column>
    <l-table-column header="GrandParent" sticky="left">
      <l-table-column header="Parent1">
        <l-table-column header="age" name="age"></l-table-column>
        <l-table-column header="age" name="age"></l-table-column>
      </l-table-column>
      <l-table-column header="Parent2">
        <l-table-column header="age" name="age"></l-table-column>
        <l-table-column header="age" name="age"></l-table-column>
      </l-table-column>
    </l-table-column>
    <l-table-column name="tel" header="tel" headerColSpan={2}></l-table-column>
    <l-table-column name="phone" header="phone"></l-table-column>
    <l-table-column name="address" header="address"></l-table-column>
    <l-table-column header="name" name="name"></l-table-column>
    <l-table-column name="tel" header="tel"></l-table-column>
    <l-table-column name="phone" header="phone"></l-table-column>
    <l-table-column header="age" name="age" sticky="right"></l-table-column>
    <l-table-column name="address" header="address"></l-table-column>
    <l-table-column header="age last" name="age" sticky="right"></l-table-column>
  </l-table>
);
