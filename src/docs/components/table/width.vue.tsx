import { tableData } from 'data';

export default () => (
  <l-table
    data={tableData}
    columns={[
      { name: 'name', width: 'min-content', header: 'Address' },
      {
        header: 'GrandParent',
        sticky: 'left',
        id: 'grandParent',
        children: [
          {
            header: 'Parent1',
            id: 'parent1',
            children: [
              { header: 'name', name: 'name', width: 100 },
              { header: 'age', name: 'age', width: 50 },
            ],
          },
          {
            header: 'Parent2',
            id: 'parent2',
            children: [
              { header: 'name', name: 'name', width: 100 },
              { header: 'age', name: 'age', width: 80 },
            ],
          },
        ],
      },
      { name: 'tel', width: '1fr', header: 'Tel' },
    ]}
  ></l-table>
);
