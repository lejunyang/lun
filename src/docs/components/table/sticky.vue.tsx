import { tableData } from 'data';

export default () => (
  <l-table data={tableData}>
    <l-table-column label="name" name="name" sticky></l-table-column>
    <l-table-column label="GrandParent" sticky="left">
      <l-table-column label="Parent1">
        <l-table-column label="age" name="age"></l-table-column>
        <l-table-column label="age" name="age"></l-table-column>
      </l-table-column>
      <l-table-column label="Parent2">
        <l-table-column label="age" name="age"></l-table-column>
        <l-table-column label="age" name="age"></l-table-column>
      </l-table-column>
    </l-table-column>
    <l-table-column name="tel" label="tel" headerColSpan={2}></l-table-column>
    <l-table-column name="phone" label="phone"></l-table-column>
    <l-table-column name="address" label="address"></l-table-column>
    <l-table-column label="name" name="name"></l-table-column>
    <l-table-column name="tel" label="tel"></l-table-column>
    <l-table-column name="phone" label="phone"></l-table-column>
    <l-table-column label="age" name="age" sticky="right"></l-table-column>
    <l-table-column name="address" label="address"></l-table-column>
    <l-table-column label="age last" name="age" sticky="right"></l-table-column>
  </l-table>
);
