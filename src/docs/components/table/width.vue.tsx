import { tableData } from 'data';

export default () => (
  <l-table
    data={tableData}
    columns={[
      { name: 'name', width: 'min-content', label: 'Address' },
      {
        label: 'GrandParent',
        sticky: 'left',
        id: 'grandParent',
        children: [
          {
            label: 'Parent1',
            id: 'parent1',
            children: [
              { label: 'name', name: 'name', width: 100 },
              { label: 'age', name: 'age', width: 50 },
            ],
          },
          {
            label: 'Parent2',
            id: 'parent2',
            children: [
              { label: 'name', name: 'name', width: 100 },
              { label: 'age', name: 'age', width: 80 },
            ],
          },
        ],
      },
      { name: 'tel', width: '1fr', label: 'Tel' },
    ]}
  ></l-table>
);
