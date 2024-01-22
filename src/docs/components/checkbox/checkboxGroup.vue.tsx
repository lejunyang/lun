import { options } from 'data';

export default () => {
  return (
    <>
      <l-checkbox-group
        onUpdate={(e) => console.log('check', e.detail)}
        options={[{ checkForAll: true, label: '全选' }, ...options]}
      >
        <l-checkbox readonly value="readonly">
          readonly项
        </l-checkbox>
        <l-checkbox>无value项</l-checkbox>
      </l-checkbox-group>
      <div class="w-full">
        <div class="container">
          <l-button onClick={() => (document.getElementById('checkbox-group-v1') as any)?.checkAll()}>全选</l-button>
          <l-button onClick={() => (document.getElementById('checkbox-group-v1') as any)?.reverse()}>反选</l-button>
          <l-button onClick={() => (document.getElementById('checkbox-group-v1') as any)?.uncheckAll()}>清空</l-button>
        </div>
        <l-checkbox-group
          class="w-full"
          id="checkbox-group-v1"
          onUpdate={(e) => console.log('check', e.detail)}
          options={options}
        />
      </div>
    </>
  );
};
