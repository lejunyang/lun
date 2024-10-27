import { iTree } from '@lun-web/components';
import { ref } from 'vue';

const tree = ref<iTree>();
export default () => {
  return (
    <>
      <l-button onClick={() => tree.value.methods.check.checkAll()}>全选</l-button>
      <l-button onClick={() => tree.value.methods.check.uncheckAll()}>清空</l-button>
      <l-button onClick={() => tree.value.methods.check.reverse()}>反选</l-button>
      <l-tree checkable defaultExpandAll ref={tree}>
        <l-tree-item label="1" value="1">
          <l-tree-item label="1-1" value="1-1">
            <l-tree-item label="1-1-1" value="1-1-1"></l-tree-item>
            <l-tree-item label="1-1-2" value="1-1-2"></l-tree-item>
            <l-tree-item disabled label="1-1-3" value="1-1-3"></l-tree-item>
          </l-tree-item>
          <l-tree-item label="1-2" value="1-2"></l-tree-item>
        </l-tree-item>
        <l-tree-item label="2" value="2"></l-tree-item>
      </l-tree>
    </>
  );
};
