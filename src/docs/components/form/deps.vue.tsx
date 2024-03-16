import { pick } from "@lun/utils";

const props = ['disableWhenDepFalsy', 'clearWhenDepChange', 'requireWhenDepTruthy'];
export default () => {
  return (
    <l-form
      defaultFormData={{
        disableWhenDepFalsy: true,
        clearWhenDepChange: true,
        requireWhenDepTruthy: true,
      }}
      itemProps={({ formContext, formItemProps }) => ({
        element: props.includes(formItemProps.name) ? 'switch' : 'input',
        ...pick(formContext.form.formData, props),
      })}
      cols={1}
    >
      <l-form-item label="disableWhenDepFalsy" name="disableWhenDepFalsy" />
      <l-form-item label="clearWhenDepChange" name="clearWhenDepChange" />
      <l-form-item label="requireWhenDepTruthy" name="requireWhenDepTruthy" />

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
