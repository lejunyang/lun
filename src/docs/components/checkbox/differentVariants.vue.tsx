export default () => (
  <>
    <l-checkbox variant="surface">surface</l-checkbox>
    <l-checkbox variant="soft">soft</l-checkbox>
    <l-checkbox-group variant="soft">
      <l-checkbox checkForAll>全选</l-checkbox>
      <l-checkbox variant="surface">soft group下的surface</l-checkbox>
    </l-checkbox-group>
  </>
);
