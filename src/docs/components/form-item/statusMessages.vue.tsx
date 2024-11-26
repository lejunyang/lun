import { useForm } from '@lun-web/core';

const form = useForm({
  defaultData: {
    num: 21,
  },
  defaultFormState: {
    statusMessages: {
      num: {
        error: ['数字必须小于20', '数字必须为偶数'],
        warning: ['最好在15～20之间'],
        success: ['数字必须大于10'],
      },
    },
  },
});
const itemProps = {
  name: 'num',
  label: '数字',
  type: 'number',
  element: 'input',
  validateWhen: 'update',
  visibleStatuses: ['error', 'warning', 'success'],
  validators: (value: number) => {
    const moreThan10 = value > 10,
      lessThan20 = value < 20,
      even = value % 2 === 0,
      better = value > 15 && value < 20;
    return [
      { message: '数字必须大于10', status: moreThan10 ? 'success' : 'error' },
      { message: '数字必须小于20', status: lessThan20 ? 'success' : 'error' },
      better ? null : { message: '最好在15～20之间', status: 'warning' },
      { message: '数字必须为偶数', status: even ? 'success' : 'error' },
    ];
  },
} as any;
export default () => {
  return (
    <div>
      <l-form instance={form}>
        <l-form-item {...itemProps} tipType="newLine" />
        <l-form-item {...itemProps} />
      </l-form>
      <pre>data: {JSON.stringify(form.data)}</pre>
      <pre>statusMessages: {JSON.stringify(form.formState.statusMessages)}</pre>
    </div>
  );
};
