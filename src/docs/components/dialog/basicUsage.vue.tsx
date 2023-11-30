import { ref } from 'vue';
import { delay } from '@lun/utils';

const open = ref(false);
export default function () {
  return (
    <>
      <l-button onClick={() => (open.value = !open.value)}>展示</l-button>
      <l-dialog
        open={open.value}
        modal
        headerTitle="标题"
        onUpdate={(e) => (open.value = e.detail)}
        beforeOk={() => delay(3000)}
        beforeClose={() => console.log('beforeClose')}
      >
        <div>内容</div>
      </l-dialog>
    </>
  );
}
