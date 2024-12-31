import { tableData } from 'data';
import { TABLE_CHECKBOX_SELECT_COLUMN } from '@lun-web/components';
import { ref } from 'vue';

const columns = [
    TABLE_CHECKBOX_SELECT_COLUMN,
    { header: 'name', name: 'name', width: '1fr' },
    { header: 'age', name: 'age', width: '1fr' },
  ],
  selected = ref();
export default () => (
  <l-table
    selectionMode="multiple"
    data={tableData}
    columns={columns}
    selected={selected.value}
    onSelect={(e) => {
      console.log(e.detail.raw, e.detail.value);
      selected.value = e.detail.raw;
    }}
  ></l-table>
);
