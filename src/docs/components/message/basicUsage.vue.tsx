import { statuses } from '@lun/components';
import { ref } from 'vue';

const msg = ref();
export default () => (
  <>
    <l-button onClick={() => msg.value?.open()}>open</l-button>
    {statuses.map((status) => (
      <l-button
        status={status}
        onClick={() =>
          msg.value?.open({
            type: status,
            onAllClosed() {
              console.log('All closed');
            },
          })
        }
      >
        open {status}
      </l-button>
    ))}
    <l-message ref={msg} message="This is a message"></l-message>
  </>
);
