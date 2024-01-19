export default () => (
  <>
    <l-checkbox variant="surface">surface</l-checkbox>
    <l-checkbox variant="soft">soft</l-checkbox>
    <l-checkbox-group variant="soft" size="2">
      <l-checkbox value="default">soft group下选项1</l-checkbox>
      <l-checkbox variant="surface" value="surface" size="3">
        soft group下的surface
      </l-checkbox>
    </l-checkbox-group>
  </>
);
