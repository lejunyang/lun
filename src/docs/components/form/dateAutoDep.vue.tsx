import { useForm } from '@lun-web/core';

const form = useForm({}),
  itemProps = {
    validateWhen: ['update'],
    tipType: 'newLine',
    type: 'date',
  } as any;
export default () => {
  return (
    <div>
      <l-form instance={form} cols={2} labelLayout="vertical" itemProps={itemProps}>
        <l-form-item name="rangeStart" label="Range start" element="calendar" max="rangeEnd" />
        <l-form-item name="rangeEnd" label="Range end" element="calendar" min="rangeStart" />
      </l-form>
      <pre>data: {JSON.stringify(form.data)}</pre>
      <pre>statusMessages: {JSON.stringify(form.formState.statusMessages)}</pre>
    </div>
  );
};
