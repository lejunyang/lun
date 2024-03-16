import { useForm } from '@lun/core';
import { ref } from 'vue';

const input = ref('111');
const mul = ref(['1']);
const instance = useForm();
export default () => {
  return (
    <>
      <pre style="flex-basis: 100%">value: {instance.formData.input}</pre>
      <l-form cols={1} instance={instance}>
        <l-form-item name="input" label={`updateWhen="input"`}>
          <l-input updateWhen="input" />
        </l-form-item>
        <l-form-item name="input" label={`updateWhen="not-composing"`}>
          <l-input updateWhen="not-composing" />
        </l-form-item>
        <l-form-item name="input" label={`updateWhen="change"`}>
          <l-input updateWhen="change" />
        </l-form-item>
      </l-form>
      <pre style="flex-basis: 100%">multiple values: {JSON.stringify(instance.formData.multi)}</pre>
      <l-form cols={1} instance={instance}>
        <l-form-item name="multi" label={`updateWhen="input"`}>
          <l-input updateWhen="input" multiple />
        </l-form-item>
        <l-form-item name="multi" label={`updateWhen="not-composing"`}>
          <l-input updateWhen="not-composing" multiple />
        </l-form-item>
        <l-form-item name="multi" label={`updateWhen="change"`}>
          <l-input updateWhen="change" multiple />
        </l-form-item>
        <l-form-item name="multi" label={`updateWhen={['change', 'not-composing']}`}>
          <l-input updateWhen={['change', 'not-composing']} multiple />
        </l-form-item>
      </l-form>
    </>
  );
};
