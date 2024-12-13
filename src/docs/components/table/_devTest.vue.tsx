import { tableData } from 'data';

const columns = [
  { label: 'name', name: 'name', width: 100, id: 'name', sticky: true },
  {
    label: 'GrandParent',
    sticky: 'left',
    id: 'grandParent',
    children: [
      {
        label: 'Parent1',
        id: 'parent1',
        children: [
          { label: 'age', name: 'age', width: 100 },
          { label: 'age', name: 'age', width: 100 },
        ],
      },
      {
        label: 'Parent2',
        id: 'parent2',
        children: [
          { label: 'age', name: 'age', width: 100 },
          { label: 'age', name: 'age', width: 100 },
        ],
      },
    ],
  },
  { label: 'tel', name: 'tel', headerColSpan: 2 },
  { label: 'phone', name: 'phone' },
  { label: 'address', name: 'address' },
  { label: 'name', name: 'name' },
  { label: 'tel', name: 'tel' },
  { label: 'phone', name: 'phone' },
  { label: 'age', name: 'age', sticky: 'right' },
  { label: 'address', name: 'address' },
];

export default () => (
  <>
    <l-table columns={columns} data={tableData} />
  </>
);
