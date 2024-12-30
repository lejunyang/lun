import { ref } from 'vue';

const selectable = ref('line'),
  selectionMode = ref('single');
export default () => {
  return (
    <>
      selectable: <l-radio-group options={['line', 'label']} v-update={selectable.value}></l-radio-group>
      selectionMode:
      <l-select options={['single', 'multiple', 'ctrl-multiple']} v-update:value={selectionMode.value}></l-select>
      <l-tree selectionMode={selectionMode.value} selectable={selectable.value} defaultExpandAll>
        <l-tree-item label="1" value="1">
          <l-tree-item label="1-1" value="1-1">
            <l-tree-item label="1-1-1" value="1-1-1"></l-tree-item>
            <l-tree-item label="1-1-2" value="1-1-2"></l-tree-item>
          </l-tree-item>
          <l-tree-item label="1-2" value="1-2"></l-tree-item>
        </l-tree-item>
        <l-tree-item label="2" value="2"></l-tree-item>
      </l-tree>
    </>
  );
};
