export default () => {
  return (
    <>
      <l-checkbox>勾选</l-checkbox>
      <l-checkbox readonly checked>
        只读
      </l-checkbox>
      <l-checkbox readonly intermediate>
        只读
      </l-checkbox>
      <l-checkbox disabled checked>
        禁用
      </l-checkbox>
      <l-checkbox disabled intermediate>
        禁用
      </l-checkbox>
      <l-checkbox disabled>禁用</l-checkbox>
    </>
  );
};
