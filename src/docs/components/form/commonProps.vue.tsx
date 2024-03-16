import { options } from 'data';

export default () => (
  <l-form
    cols={2}
    itemProps={({ formContext, formItemProps }) => ({
      element: formItemProps.name === 'file' ? 'file-picker' : 'input',
      elementProps: {
        variant: formItemProps.name === 'switch' ? undefined : 'soft',
        color: formItemProps.name === 'field2' ? 'teal' : 'tomato',
        size: formContext.form.formData.switch ? '3' : '2',
      },
    })}
  >
    <l-form-item name="field1" label="字段1" />
    <l-form-item name="field2" label="字段2" />
    <l-form-item name="field3" label="字段3" element="select" elementProps={{ options }} />
    <l-form-item name="file" label="文件">
      <l-button>点击选择</l-button>
    </l-form-item>
    <l-form-item name="switch" label="变大！" element="switch" variant="surface" />
  </l-form>
);
