import { useForm } from '@lun/core';

const form = useForm({
  defaultFormData: {
    step: 1,
    precision: 0,
  },
});
const itemProps = { step: 'step', precision: 'precision', element: 'input' as const };
export default () => {
  return (
    <div>
      <l-form instance={form} cols={3} itemProps={itemProps}>
        <l-form-item name="step" label="数字布长" type="number" step={1} />
        <l-form-item name="precision" label="数字精度" min="0" precision={0} type="number" />
        <l-form-item name="age" label="年龄" required min="0" help="min=0" type="number" newLine />
        <l-form-item name="factor" label="因子" required min="0" help="min=0" helpType="newLine" tip="提示" />
        <l-form-item name="total" label="总量" required min="0" type="number" newLine />
        <l-form-item name="used" label="已使用" required min="0" max="total" type="number" deps="total" />
      </l-form>
      <pre>formData: {JSON.stringify(form.formData)}</pre>
      <pre>formErrors: {JSON.stringify(form.formState.errors)}</pre>
    </div>
  );
};
