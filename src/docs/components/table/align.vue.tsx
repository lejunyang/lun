import { tableData } from 'data';

export default () => (
  <l-table
    data={tableData}
    columns={[
      { label: 'start', name: 'age', width: '1fr', align: 'start' },
      { label: 'center', name: 'age', width: '1fr', align: 'center' },
      { label: 'end', name: 'age', width: '1fr', align: 'end' },
    ]}
  ></l-table>
);
