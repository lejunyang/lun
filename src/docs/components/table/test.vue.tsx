export default () => (
  <l-table
    data={[
      { name: 'John', age: 20, address: 'New York', tele: '123456' },
      { name: 'Jane', age: 25, address: 'London', tele: '654321' },
      { name: 'Bob', age: 30, address: 'Paris', tele: '987654' },
    ]}
  >
    <l-table-column label="1">
      <l-table-column label="1-1" name="name"></l-table-column>
      <l-table-column label="1-2" name="age"></l-table-column>
    </l-table-column>
    <l-table-column name="tele" label="222"></l-table-column>
    <l-table-column name="address" label="333"></l-table-column>
  </l-table>
);
