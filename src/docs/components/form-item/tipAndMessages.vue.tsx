export default () => {
  return (
    <l-form
      itemProps={{
        element: 'input',
        type: 'number',
        required: true,
        min: 0,
        max: 5,
      }}
    >
      <l-form-item name="item1" label="newLine tip" tip="This is a tip" tipType="newLine" />
      <l-form-item
        name="item2"
        label="newLine tip&help"
        tip="This is a tip"
        help="This is a help"
        tipType="newLine"
        helpType="newLine"
      />
      <l-form-item
        name="item3"
        label="tooltip tip&help"
        tip="This is a tip"
        help="This is a help"
        tipType="tooltip"
        helpType="tooltip"
      />
      <l-form-item
        name="item4"
        label="tooltip tip, icon help"
        tip="This is a tip"
        help="This is a help"
        tipType="tooltip"
        helpType="icon"
      />
    </l-form>
  );
};
