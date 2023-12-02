export default function () {
  return (
    <>
      <l-radio-group>
        <l-radio value="1">单选1</l-radio>
        <l-radio value="2">单选2</l-radio>
        <l-radio value="3" disabled>
          禁用
        </l-radio>
      </l-radio-group>
      <l-radio value="4" disabled checked>
        禁用
      </l-radio>
    </>
  );
}
