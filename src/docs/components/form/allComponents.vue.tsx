import { useForm } from '@lun-web/core';
import { arrayFrom } from '@lun-web/utils';

const form = useForm({
  defaultData: {
    cols: '2',
    obj: {
      input1: '对象里的字段',
    },
    array: [null],
  },
});
const options = arrayFrom(2, (_, index) => ({ value: `option${index}`, label: `option${index}` }));

export default function () {
  return (
    <div>
      <l-form
        instance={form}
        cols={form.data.cols}
        onUpdate={(e) => {
          console.log('form update', e.detail);
        }}
      >
        <l-form-item name="cols" label="列数" type="number">
          <l-input />
        </l-form-item>
        <l-form-item name="array" array label="数组">
          <div style="display: flex; flex-wrap: wrap; gap: 5px;">
            {Array.isArray(form.data.array) &&
              form.data.array.map((_, index) => (
                <l-input key={index}>
                  <l-button slot="append" onClick={() => form.data.array.splice(index, 1)} variant="ghost">
                    删除
                  </l-button>
                </l-input>
              ))}
            <l-button onClick={() => form.data.array.push(null)}>添加</l-button>
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
        <l-form-item name="switch" label="开关" element="switch" />
        <l-form-item name="textarea" label="文本域" element="textarea" />
        <l-form-item name="file" label="文件">
          <l-file-picker>
            <l-button>选择文件</l-button>
          </l-file-picker>
        </l-form-item>
      </l-form>
      <pre>
        data:
        {JSON.stringify(form.data, (key, value) => {
          if (key === 'file') {
            return value?.name;
          } else return value;
        })}
      </pre>
    </div>
  );
}
