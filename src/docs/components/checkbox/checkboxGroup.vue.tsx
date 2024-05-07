import { options } from 'data';
import { ref } from 'vue';

const group = ref();
export default () => {
  return (
    <>
      <div class="w-full">内部控制全选</div>
      <l-checkbox-group
        onUpdate={(e) => console.log('check', e.detail)}
        options={[{ checkForAll: true, label: '全选' }, ...options]}
      >
        <l-checkbox readonly value="readonly">
          readonly项
        </l-checkbox>
        <l-checkbox>无value项</l-checkbox>
      </l-checkbox-group>
      <div class="w-full" style="margin-top: 20px;">
        外部控制全选
      </div>
      <div class="container">
        <l-button onClick={() => group.value?.checkAll()}>全选</l-button>
        <l-button onClick={() => group.value?.reverse()}>反选</l-button>
        <l-button onClick={() => group.value?.uncheckAll()}>清空</l-button>
      </div>
      <l-checkbox-group class="w-full" ref={group} onUpdate={(e) => console.log('check', e.detail)} options={options} />
    </>
  );
};
