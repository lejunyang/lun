import { useForm } from '@lun/core';
import { ref } from 'vue';

const form = useForm({
  defaultFormData: {
    replaceChPeriodMark: true,
    type: 'number-string',
  },
});
const v = ref(null);
export default () => {
  return (
    <l-form instance={form} cols={3} itemProps={{ element: 'input' }}>
      <l-form-item
        name="type"
        label="数字类型"
        colSpan={3}
        element="radio-group"
        elementProps={{
          options: [
            { value: 'number', label: 'number' },
            { value: 'number-string', label: 'number-string' },
          ],
        }}
      />
      <l-form-item name="step" label="布长" type="number" step={1} />
      <l-form-item name="precision" label="精度" min="0" precision={0} type="number" />
      <l-form-item name="min" label="min" type="number" />
      <l-form-item name="max" label="max" type="number" />
      <l-form-item name="moreThan" label="moreThan" type="number" />
      <l-form-item name="lessThan" label="lessThan" type="number" />
      <l-form-item name="strictStep" label="严格布长" element="switch" newLine />
      <l-form-item name="noExponent" label="禁止指数" element="switch" />
      <l-form-item name="replaceChPeriodMark" label="句号视为小数点" element="switch" />
      <l-form-item
        label="被限制的数字"
        newLine
        colSpan={3}
        elementProps={form.formData}
        onUpdate={(e) => {
          console.log('e.detail', e.detail);
          v.value = e.detail;
        }}
      />
      <pre>{String(v.value)}</pre>
    </l-form>
  );
};
