import { Dialog } from '@lun-web/components';
import { text } from 'data';

const statuses = ['success', 'error', 'warning', 'info'];
export default () => {
  return (
    <>
      <l-button
        onClick={() =>
          Dialog.open({
            header: 'Header',
            content: 'Content',
          })
        }
        label="点击打开"
      />
      {statuses.concat(statuses).map((s, i) => (
        <l-button
          status={s}
          onClick={() =>
            Dialog[s]({
              header: i > 3 ? '' : s,
              content: text,
            })
          }
        >
          {i > 3 ? s + '-no-header' : s}
        </l-button>
      ))}
    </>
  );
};
