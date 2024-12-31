import { Message, TABLE_CHECKBOX_SELECT_COLUMN } from '@lun-web/components';
import { tableData } from 'data';

export default () => (
  <l-table
    data={tableData}
    actions={(params) => {
      Message.info(`You clicked on row ${params.index}, column "${params.props.name}"`);
    }}
    selectionMode="multiple"
    columns={[
      TABLE_CHECKBOX_SELECT_COLUMN,
      {
        header: 'name',
        name: 'name',
        width: '1fr',
        actions: {
          onCellClick: ({ context, key }) => {
            context.rowExpand.toggle(key);
          },
          onCellContextmenu: ({ row, props }) => {
            Message.info(`You right clicked on cell ${row[props.name]}`);
          },
        },
      },
      {
        header: 'age',
        name: 'age',
        width: '1fr',
        actions: ({ context, key }) => {
          context.rowSelect.toggle(key);
        },
      },
    ]}
    rowExpandedRenderer={(row) => (
      <div style="padding: 10px">
        <b>Address: </b>
        <code>{row.address}</code>
      </div>
    )}
  ></l-table>
);
