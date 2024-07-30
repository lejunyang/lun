import { useForm } from '@lun/core';
import { ref } from 'vue';

const input = ref('111');
const mul = ref(['1']);
const instance = useForm();
export default () => {
  return (
    <>
      <pre style="flex-basis: 100%">value: {instance.data.input}</pre>
      <l-form cols={1} instance={instance}>
        <l-form-item name="input" label={`updateWhen="input"`}>
          <l-input updateWhen="input" />
        </l-form-item>
        <l-form-item name="input" label={`updateWhen="notComposing"`}>
          <l-input updateWhen="notComposing" />
        </l-form-item>
        <l-form-item name="input" label={`updateWhen="change"`}>
          <l-input updateWhen="change" />
        </l-form-item>
      </l-form>
      <pre style="flex-basis: 100%">multiple values: {JSON.stringify(instance.data.multi)}</pre>
      <l-form cols={1} instance={instance}>
        <l-form-item name="multi" label={`updateWhen="input"`}>
          <l-input updateWhen="input" multiple />
        </l-form-item>
        <l-form-item name="multi" label={`updateWhen="notComposing"`}>
          <l-input updateWhen="notComposing" multiple />
        </l-form-item>
        <l-form-item name="multi" label={`updateWhen="change"`}>
          <l-input updateWhen="change" multiple />
        </l-form-item>
        <l-form-item name="multi" label={`updateWhen={['change', 'notComposing']}`}>
          <l-input updateWhen={['change', 'notComposing']} multiple />
        </l-form-item>
      </l-form>
    </>
  );
};
