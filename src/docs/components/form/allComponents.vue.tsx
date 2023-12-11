import { useForm } from '@lun/components';

const form = useForm({
  defaultFormData: {
    cols: '2',
  },
});
const options = Array(2)
  .fill(0)
  .map((_, index) => ({ value: `option${index}`, label: `option${index}` }));

export default function () {
  return (
    <div>
      <l-form
        formManager={form}
        cols={form.formData.cols}
        onUpdate={(e) => {
          console.log('form update', e.detail);
        }}
      >
        <l-form-item name="cols" label="列数">
          <l-input />
        </l-form-item>
        <l-form-item name="array" array label="数组">
          <l-input />
          <l-input />
        </l-form-item>
        <l-form-item name="obj.input1" label="对象1">
          <l-input />
        </l-form-item>
        <l-form-item name="obj.input2" label="对象2">
          <l-input />
        </l-form-item>
        <l-form-item name="checkbox" label="复选框组">
          <l-checkbox-group options={options} />
        </l-form-item>
        <l-form-item name="radio" label="单选框组">
          <l-radio-group options={options} />
        </l-form-item>
        <l-form-item name="select" label="下拉框">
          <l-select options={options} />
        </l-form-item>
        <l-form-item name="selects" label="多选下拉框">
          <l-select options={options} multiple />
        </l-form-item>
      </l-form>
      <pre>formData: {JSON.stringify(form.formData)}</pre>
    </div>
  );
}
