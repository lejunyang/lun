import { Message } from '@lun-web/components';

const statuses = ['success', 'error', 'warning', 'info'] as const;
export default () => {
  return (
    <>
      <l-button
        onClick={() =>
          Message.open({
            message: 'message',
          })
        }
        label="点击展示"
      />
      {statuses.map((s) => (
        <l-button status={s} onClick={() => Message[s](s)}>
          {s}
        </l-button>
      ))}
    </>
  );
};
