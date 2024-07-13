import { useForm } from '@lun/core';

const form = useForm({
  defaultFormData: {
    unmountBehavior: null,
    enabled: true,
    input: '1',
  },
});
const selectProps = {
  options: ['delete', 'toNull', 'toUndefined'],
};
export default () => (
  <>
    <l-form instance={form}>
      <l-form-item element="select" name="unmountBehavior" label="unmountBehavior" elementProps={selectProps} />
      <l-form-item element="switch" name="enabled" label="toggle input" />
      {form.formData.enabled && (
        <l-form-item element="input" name="input" label="input" unmountBehavior={form.formData.unmountBehavior} />
      )}
    </l-form>
    <pre class="w-full">
      input in formData: {String('input' in form.formData)} <br /> input value: {String(form.formData.input)}
    </pre>
  </>
);
