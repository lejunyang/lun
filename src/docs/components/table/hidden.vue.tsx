import { tableData } from 'data';
import { ref } from 'vue';

const show = ref(true),
  show2 = ref(true),
  props = { style: { whiteSpace: 'nowrap' } };
export default () => (
  <>
    <div class="w-full">
      tel(hidden):
      <l-switch v-update-checked:checked={show.value} />
      address(0fr):
      <l-switch v-update-checked:checked={show2.value} />
    </div>
    <l-table data={tableData}>
      <l-table-column name="tel" header="tel" hidden={!show.value}></l-table-column>
      <l-table-column
        name="address"
        header="address"
        width={show2.value ? '1fr' : '0fr'}
        cellProps={props}
        headerProps={props}
      ></l-table-column>
    </l-table>
  </>
);
