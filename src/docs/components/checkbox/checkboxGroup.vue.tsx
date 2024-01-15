export default () => (
  <l-checkbox-group onUpdate={(e) => console.log('check', e.detail)}>
    <l-checkbox checkForAll>全选</l-checkbox>
    <l-checkbox value="1">选项 1</l-checkbox>
    <l-checkbox value="2" disabled>
      选项 2
    </l-checkbox>
    <l-checkbox value="3">选项 3</l-checkbox>
    <l-checkbox>无value项</l-checkbox>
  </l-checkbox-group>
);
