import { useForm } from '@lun/core';

const form = useForm({
  defaultFormData: {
    cols: '2',
    array: [null],
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
          <div style="display: flex; flex-wrap: wrap; gap: 5px;">
            {Array.isArray(form.formData.array) &&
              form.formData.array.map((_, index) => (
                <l-input key={index}>
                  <l-button slot="append" onClick={() => form.formData.array.splice(index, 1)} variant="ghost">
                    删除
                  </l-button>
                </l-input>
              ))}
            <l-button onClick={() => form.formData.array.push(null)}>添加</l-button>
          </div>
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
