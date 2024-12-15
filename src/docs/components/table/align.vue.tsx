import { tableData } from 'data';

const children = [
  { header: 'start', name: 'age', width: '1fr', justify: 'start', align: 'start' },
  { header: 'center', name: 'age', width: '1fr', justify: 'center' },
];
export default () => (
  <l-table
    data={tableData}
    columns={[
      ...children,
      { header: 'end', name: 'age', width: '1fr', justify: 'end', align: 'end' },
      { header: 'end', name: 'age', width: '1fr', justify: 'end', children },
    ]}
  ></l-table>
);
