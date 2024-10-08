export default () => {
  return (
    <>
      <l-tree checkable defaultExpandAll>
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
