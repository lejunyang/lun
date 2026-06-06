import { tableData } from 'data';

const columns = [
  { header: 'name', name: 'name', width: 100, id: 'name', sticky: true },
  {
    header: 'GrandParent',
    sticky: 'left',
    id: 'grandParent',
    children: [
      {
        header: 'Parent1',
        id: 'parent1',
        children: [
          { header: 'age', name: 'age', width: 100 },
          { header: 'age', name: 'age', width: 100 },
        ],
      },
      {
        header: 'Parent2',
        id: 'parent2',
        children: [
          { header: 'age', name: 'age', width: 100 },
          { header: 'age', name: 'age', width: 100 },
        ],
      },
    ],
  },
  { header: 'tel', name: 'tel', headerColSpan: 2 },
  { header: 'phone', name: 'phone' },
  { header: 'address', name: 'address' },
  { header: 'name', name: 'name' },
  { header: 'tel', name: 'tel' },
  { header: 'phone', name: 'phone' },
  { header: 'age', name: 'age', sticky: 'right' },
  { header: 'address', name: 'address' },
];

export default () => (
  <>
    <l-table columns={columns} data={tableData} id="ljy">
      <l-table-column name="extra" header="extra" />
      <l-table-column name="extra2" header="extra2">
        <l-table-column name="extra2.1" header="extra2.1" />
        <l-table-column name="extra2.2" header="extra2.2" />
      </l-table-column>
      <l-table-column name="extra3" header="extra3" />
    </l-table>
  </>
);
