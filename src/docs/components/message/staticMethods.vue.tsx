import { Message } from '@lun/components';

const statuses = ['success', 'error', 'warning', 'info'] as const;
export default () => {
  return (
    <>
      <l-button
        onClick={() =>
          Message.open({
            description: 'Description',
          })
        }
        label="点击展示"
      />
      {statuses.map((s) => (
        <l-button status={s} onClick={() => Message[s](s)}>{s}</l-button>
      ))}
    </>
  );
};
