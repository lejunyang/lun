import { tableData } from 'data';
import { ref } from 'vue';

const expanded = ref(new Set());
export default () => (
  <l-table
    data={tableData}
    rowHeight={44}
    headerHeight={44}
    actions="toggleRowExpand"
    columns={[
      { header: 'name', name: 'name', width: '1fr' },
      { header: 'age', name: 'age', width: '1fr' },
    ]}
    rowExpandedRenderer={(row) => (
      <div style="padding: 10px">
        <b>Address: </b>
        <code>{row.address}</code>
      </div>
    )}
    rowExpanded={expanded.value}
    onRowExpand={(e) => {
      console.log('onRowExpand', e.detail.raw, e.detail.value);
      expanded.value = e.detail.raw;
    }}
  ></l-table>
);
