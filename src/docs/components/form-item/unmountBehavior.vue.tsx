import { useForm } from '@lun-web/core';

const form = useForm({
  defaultData: {
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
      {form.data.enabled && (
        <l-form-item element="input" name="input" label="input" unmountBehavior={form.data.unmountBehavior} />
      )}
    </l-form>
    <pre class="w-full">
      input in data: {String('input' in form.data)} <br /> input value: {String(form.data.input)}
    </pre>
  </>
);
