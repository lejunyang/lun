import { useForm } from '@lun/core';

const form = useForm();

export default () => {
  return (
    <div>
      <l-form formManager={form}>
        <l-form-item name="age" label="年龄" required min="0" element="input" help="min=0" />
        <l-form-item name="factor" label="因子" required min="0" element="input" help="min=0" helpType="newLine" />
      </l-form>
      <pre>formErrors: {JSON.stringify(form.formState.errors)}</pre>
    </div>
  );
};