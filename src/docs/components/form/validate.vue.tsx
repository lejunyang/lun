import { useForm } from '@lun/core';

const form = useForm();

export default () => {
  return (
    <div>
      <l-form instance={form}>
        <l-form-item name="age" label="年龄" required min="0" element="input" help="min=0" type="number" />
        <l-form-item name="factor" label="因子" required min="0" element="input" help="min=0" helpType="newLine" tipType="tooltip" tip="提示" />
      </l-form>
      <pre>formErrors: {JSON.stringify(form.formState.errors)}</pre>
    </div>
  );
};
