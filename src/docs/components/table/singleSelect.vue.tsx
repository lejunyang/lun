import { tableData } from 'data';
import { TABLE_RADIO_SELECT_COLUMN } from '@lun-web/components';
import { ref } from 'vue';

const columns = [
    TABLE_RADIO_SELECT_COLUMN,
    { header: 'name', name: 'name', width: '1fr' },
    { header: 'age', name: 'age', width: '1fr' },
  ],
  selected = ref();
export default () => (
  <l-table
    data={tableData}
    columns={columns}
    selected={selected.value}
    onSelect={(e) => {
      console.log(e.detail.value);
      selected.value = e.detail.value;
    }}
  ></l-table>
);
