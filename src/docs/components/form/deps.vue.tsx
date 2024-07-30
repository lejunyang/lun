import { pick } from '@lun/utils';

const props = ['disableWhenDep', 'clearWhenDepChange', 'requireWhenDep'];
const options = ['all-truthy', 'some-truthy', 'all-falsy', 'some-falsy'];
export default () => {
  return (
    <l-form
      defaultData={{
        disableWhenDep: ['all-falsy'],
        clearWhenDepChange: true,
        requireWhenDep: ['all-truthy'],
      }}
      itemProps={({ formContext, formItemProps }) => ({
        element: props.includes(formItemProps.name) ? 'switch' : 'input',
        ...pick(formContext.form.data, props),
      })}
      cols={1}
    >
      <l-form-item label="clearWhenDepChange" name="clearWhenDepChange" />
      <l-form-item
        label="disableWhenDep"
        name="disableWhenDep"
        element="select"
        elementProps={{ options, multiple: true }}
      />
      <l-form-item
        label="requireWhenDep"
        name="requireWhenDep"
        element="select"
        elementProps={{ options, multiple: true }}
      />

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
      <l-form-item label="id" name="user.id" deps="user.name" disableWhenDep={null} clearWhenDepChange={false} />
    </l-form>
  );
};
