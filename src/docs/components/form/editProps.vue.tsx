import { useForm } from '@lun-web/core';
import { arrayFrom } from '@lun-web/utils';

const form = useForm();
const options = arrayFrom(2, (_, index) => ({ value: `option${index}`, label: `option${index}` }));
export default () => (
  <>
    <l-form instance={form} class="w-full">
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
    <l-button
      onClick={() => {
        form.formState.disabled = !form.formState.disabled;
      }}
    >
      disable: {String(!!form.formState.disabled)}
    </l-button>
    <l-button
      onClick={() => {
        form.formState.loading = !form.formState.loading;
      }}
    >
      loading: {String(!!form.formState.loading)}
    </l-button>
  </>
);
