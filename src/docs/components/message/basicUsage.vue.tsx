import { statuses } from '@lun-web/components';
import { ref } from 'vue';

const msg = ref(),
  variant = ref('outline'),
  options = ['outline', 'soft', 'surface'];
export default () => (
  <>
    设置消息的样式变体：<l-select v-update:value={variant.value} options={options}></l-select>
    <div class="w-full" />
    <l-button onClick={() => msg.value?.open({ variant: variant.value })}>open</l-button>
    {statuses.map((status) => (
      <l-button
        status={status}
        onClick={() =>
          msg.value?.open({
            variant: variant.value,
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
