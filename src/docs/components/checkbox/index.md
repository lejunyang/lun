
## 基本使用

<l-checkbox>勾选</l-checkbox>

## 选项组

<l-checkbox-group @update="console.log('value', $event.detail)">
  <l-checkbox checkForAll>全选</l-checkbox>
  <l-checkbox :value="1">选项1</l-checkbox>
  <l-checkbox :value="2" disabled>选项2</l-checkbox>
  <l-checkbox :value="3">选项3</l-checkbox>
  <l-checkbox>无value</l-checkbox>
</l-checkbox-group>