import { Message } from '@lun-web/components';
import { tableData } from 'data';

export default () => (
  <l-table
    data={tableData}
    actions={(params) => {
      Message.info(`You clicked on row ${params.index}, column "${params.props.header}"`);
    }}
    columns={[
      {
        header: 'name',
        name: 'name',
        width: '1fr',
        actions: {
          onCellClick: (params) => {
            params.actions.toggleRowExpand();
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
        actions: () => {
          Message.info(`No action, try click or right click on 'name' column`);
        },
      },
    ]}
    expandable={() => true}
    expandedRenderer={(row) => (
      <div style="padding: 10px">
        <b>Address: </b>
        <code>{row.address}</code>
      </div>
    )}
  ></l-table>
);
