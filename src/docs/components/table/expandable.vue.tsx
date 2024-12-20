import { tableData } from 'data';

export default () => (
  <l-table
    data={tableData}
    columns={[
      { header: 'name', name: 'name', width: '1fr' },
      { header: 'age', name: 'age', width: '1fr' },
    ]}
    expandable={() => true}
    expandedRenderer={(row) => row.address}
  ></l-table>
);
