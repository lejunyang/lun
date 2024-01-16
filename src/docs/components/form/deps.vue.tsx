export default () => {
  return (
    <l-form
      itemProps={{ element: 'input', disableWhenDepFalsy: true, clearWhenDepChange: true, requireWhenDepTruthy: true }}
      cols={3}
    >
      <l-form-item label="省" name="province" required />
      <l-form-item label="市" name="city" deps="province" />
      <l-form-item label="区" name="region" deps="city" />
      <l-form-item
        label="姓名"
        name="user.name"
        elementProps={{ placeholder: '可选' }}
        help="可选，但是输入了名字必须输入id"
        helpType="icon"
      />
      <l-form-item label="id" name="user.id" deps="user.name" disableWhenDepFalsy={false} clearWhenDepChange={false} />
    </l-form>
  );
};
