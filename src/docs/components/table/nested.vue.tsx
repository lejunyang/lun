import { tableData } from 'data';

export default () => (
  <>
    <l-table data={tableData}>
      <l-table-column label="info">
        <l-table-column label="name" name="name"></l-table-column>
        <l-table-column label="age" name="age"></l-table-column>
      </l-table-column>
      <l-table-column name="tel" label="tel"></l-table-column>
      <l-table-column name="address" label="address"></l-table-column>
    </l-table>
  </>
);
