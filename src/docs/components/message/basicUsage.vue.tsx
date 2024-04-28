import { statuses } from '@lun/components';
export default () => (
  <>
    <l-button onClick={() => (document.getElementById('basic') as any)?.open()}>open</l-button>
    {statuses.map((status) => (
      <l-button
        status={status}
        onClick={() =>
          (document.getElementById('basic') as any)?.open({
            type: status,
          })
        }
      >
        open {status}
      </l-button>
    ))}
    <l-message id="basic" message="This is a message"></l-message>
  </>
);
