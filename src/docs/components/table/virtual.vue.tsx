import { TABLE_INDEX_COLUMN } from '@lun-web/components';
import { arrayFrom } from '@lun-web/utils';
import { tableData } from 'data';

const columns = [
    TABLE_INDEX_COLUMN,
    { header: 'name', name: 'name', sticky: true },
    {
      header: 'GrandParent',
      children: [
        {
          header: 'Parent1',
          children: [
            { header: 'name', name: 'name' },
            { header: 'age', name: 'age' },
          ],
        },
        {
          header: 'Parent2',
          children: [
            { header: 'name', name: 'name' },
            { header: 'age', name: 'age' },
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
  ],
  data = arrayFrom(1000, (_, i) => ({ ...tableData[i % tableData.length], key: i })),
  [first, second, ...rest] = columns;

export default () => (
  <>
    固定高度：
    <l-table columns={columns} data={data} virtual style={{ height: '400px' }} rowHeight={44} />
    自动高度：
    <l-table columns={[first, { ...second, width: 100 }, ...rest]} data={data} virtual style={{ height: '400px' }} />
  </>
);
