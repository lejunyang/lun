import { tableData } from 'data';

export default () => (
  <>
    <l-table
      data={tableData}
      columns={[
        {
          header: 'info',
          children: [
            { name: 'name', header: 'name' },
            { name: 'age', header: 'age' },
          ],
        },
      ]}
    >
      <l-table-column header="info">
        <l-table-column header="name" name="name"></l-table-column>
        <l-table-column header="age" name="age"></l-table-column>
      </l-table-column>
      <l-table-column name="tel" header="tel"></l-table-column>
      <l-table-column name="address" header="address"></l-table-column>
    </l-table>
  </>
);
