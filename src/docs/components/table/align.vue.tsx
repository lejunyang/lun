import { tableData } from 'data';

export default () => (
  <l-table
    data={tableData}
    columns={[
      { header: 'start', name: 'age', width: '1fr', align: 'start' },
      { header: 'center', name: 'age', width: '1fr', align: 'center' },
      { header: 'end', name: 'age', width: '1fr', align: 'end' },
    ]}
  ></l-table>
);
